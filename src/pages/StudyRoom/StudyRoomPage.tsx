import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./StudyRoomPage.css";

import avatarIcon from "../../assets/icons/Vector.svg";
import cameraIcon from "../../assets/icons/majesticons_camera-line.svg";
import cameraOffIcon from "../../assets/icons/majesticons_camera-line_no.svg";
import micIcon from "../../assets/icons/stash_mic-solid.svg";
import micOffIcon from "../../assets/icons/Frame 106.svg";

import { api } from "../../api/client";
import { enterPublicStudy, exitStudy } from "../../api/studies";
import { useStompChat } from "./useStompChat";
import { useWebRTCRoom } from "./useWebRTCRoom";

/* ===================== 타입 ===================== */
type Participant = {
  userId: number;
  studyParticipantId: number;
  userNickname: string;
  userProfileImageUrl?: string | null;
};

type ChatMessage = {
  id: string;
  mine: boolean;
  nickname: string;
  text: string;
};

export default function StudyRoomPage() {
  const navigate = useNavigate();
  const { studyId } = useParams();
  const numericStudyId = Number(studyId);

  // 서버 확정 전까지 WebRTC 끔 (콘솔 잡아먹어서)
  const ENABLE_WEBRTC = false;

  // StrictMode(개발환경)에서 useEffect 2번 도는 거 방지
  const initOnceRef = useRef(false);

  // "참여 성공" 플래그 (참여 성공했을 때만 exit 가능)
  const joinedRef = useRef(false);

  // 퇴장 중복 방지
  const exitCalledRef = useRef(false);

  const [me, setMe] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [bubbleMap, setBubbleMap] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  /* ===================== 퇴장 (참여 성공시에만) ===================== */
  const exitOnce = async () => {
    if (!numericStudyId) return;
    if (!joinedRef.current) return; // 참여 성공 전에는 exit 호출 X
    if (exitCalledRef.current) return;
    exitCalledRef.current = true;

    try {
      await exitStudy(numericStudyId, "STUDY");
    } catch (e) {
      console.log("exitStudy failed:", e);
    }
  };

  /* ===================== 입장 + 참가자 조회 (한 번만 실행) ===================== */
  useEffect(() => {
    if (!numericStudyId) return;
    if (initOnceRef.current) return; 
    initOnceRef.current = true;

    let mounted = true;

    (async () => {
      try {
        setError(null);

        // 1) 공개 입장 시도
        // -200: 참여 성공
        // -409: 이미 참여중 -> 정상처럼 처리
        try {
          await enterPublicStudy(numericStudyId);
        } catch (e: any) {
          const status = e?.response?.status;
          if (status !== 409) throw e;
        }

        // 2) 참여자 조회
        const res = await api.get(`/studies/${numericStudyId}/participating/users`);
        const data = res.data?.data;

        if (!mounted) return;

        setMe(data?.me ?? null);
        setParticipants(data?.participants ?? []);
        setBubbleMap(data?.participantNowStates ?? {});

        joinedRef.current = true; 
      } catch (e: any) {
        if (!mounted) return;

        const status = e?.response?.status;
        const msg = e?.response?.data?.message;
        if (status === 500) {
          setError(
            "서버에서 참여자 정보를 불러오지 못했어요."
          );
          return;
        }

        if (status === 403) {
          setError(msg ?? "스터디에 먼저 참여한 뒤 입장해주세요.");
          return;
        }

        setError(msg ?? "스터디룸 입장 실패");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [numericStudyId]);

  /* ===================== 언마운트 시 exit ===================== */
  useEffect(() => {
    return () => {
      void exitOnce();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericStudyId]);

  /* ===================== STOMP ===================== */
  const WS_BASE_URL = import.meta.env.VITE_DOMAIN_URL;

  const { events, sendChat, sendNowState } = useStompChat({
    studyId: numericStudyId,
    wsBaseUrl: WS_BASE_URL,
  }) as any;

  /* ===================== 채팅 ===================== */
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const lastEventRef = useRef(0);

  useEffect(() => {
    if (!me) return;
    if (events.length <= lastEventRef.current) return;

    const last = events[events.length - 1];
    lastEventRef.current = events.length;
    const d: any = last.data;

    switch (last.type) {
      case "CHAT_MESSAGE": {
        const nickname = d.nickname ?? d.userNickname ?? d.senderNickname ?? "";
        const text = d.message ?? d.chatMessage ?? d.chat ?? d.text ?? "";
        const spId = Number(d.studyParticipantId);

        setChatMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            mine: spId === me.studyParticipantId,
            nickname: String(nickname),
            text: String(text),
          },
        ]);
        break;
      }

      case "NOW_STATE_CHANGED": {
        const spId = Number(d.studyParticipantId);
        const state = d.state ?? d.nowState ?? "";
        setBubbleMap((prev) => ({ ...prev, [spId]: String(state) }));
        break;
      }

      case "PARTICIPANT_JOINED": {
        const joined: Participant = {
          userId: Number(d.userId ?? 0),
          studyParticipantId: Number(d.studyParticipantId ?? 0),
          userNickname: String(d.nickname ?? d.userNickname ?? ""),
          userProfileImageUrl: d.profileImageUrl ?? d.userProfileImageUrl ?? null,
        };

        if (!joined.studyParticipantId) return;

        setParticipants((prev) => {
          if (prev.some((p) => p.studyParticipantId === joined.studyParticipantId)) return prev;
          return [...prev, joined];
        });
        break;
      }

      case "PARTICIPANT_LEFT": {
        const spId = Number(d.studyParticipantId);
        setParticipants((prev) => prev.filter((p) => p.studyParticipantId !== spId));
        break;
      }
    }
  }, [events, me]);

  const onSendChat = () => {
    if (!chatInput.trim() || !me) return;

    sendChat(me.studyParticipantId, chatInput);

    setChatMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        mine: true,
        nickname: me.userNickname,
        text: chatInput,
      },
    ]);

    setChatInput("");
  };

  /* ===================== WebRTC ===================== */
  const {
    localStream,
    remoteStreams,
    remoteIds,
    peerNames,
    camOn,
    micOn,
    setCamOn,
    setMicOn,
  } = useWebRTCRoom({
    enabled: ENABLE_WEBRTC,
    roomId: String(studyId),
    signalingUrl: import.meta.env.VITE_SIGNALING_URL,
    displayName: me?.userNickname ?? "나",
  }) as any;

  const getRemoteStreamForParticipant = useMemo(() => {
    return (nickname: string, orderIndex: number) => {
      const normalized = (nickname ?? "").trim();

      if (normalized && peerNames && remoteStreams) {
        const matchedPeerId = Object.keys(peerNames).find(
          (pid) => (peerNames[pid] ?? "").trim() === normalized
        );
        if (matchedPeerId && remoteStreams[matchedPeerId]) {
          return remoteStreams[matchedPeerId] as MediaStream;
        }
      }

      const fallbackPeerId = remoteIds?.[orderIndex];
      if (fallbackPeerId && remoteStreams?.[fallbackPeerId]) {
        return remoteStreams[fallbackPeerId] as MediaStream;
      }

      return null;
    };
  }, [peerNames, remoteStreams, remoteIds]);

  /* ===================== 퇴장 버튼 ===================== */
  const handleLeave = async () => {
    await exitOnce();
    navigate("/studies");
  };

  /* ===================== 렌더 ===================== */
  if (error) {
    return (
      <div className="srError" style={{ whiteSpace: "pre-line" }}>
        {error}
      </div>
    );
  }

  if (!me) return <div className="srLoading">입장 중...</div>;

  return (
    <div className="srWrap">
      {/* ===== 상단 ===== */}
      <div className="srTopBar">
        <span>Study #{studyId}</span>
        <button className="srLeaveBtn" onClick={handleLeave}>
          나가기
        </button>
      </div>

      {/* ===== 본문 ===== */}
      <div className="srContent panelClosed">
        {/* ===== 참가자 ===== */}
        <div className="srGridSection">
          <div className="srGrid" style={{ ["--cols" as any]: 2 }}>
            {[me, ...participants].map((p, idx) => {
              const isMe = p.studyParticipantId === me.studyParticipantId;

              const stream =
                !ENABLE_WEBRTC
                  ? null
                  : isMe
                  ? (localStream as MediaStream | null)
                  : (getRemoteStreamForParticipant(p.userNickname, idx - 1) as MediaStream | null);

              return (
                <div key={p.studyParticipantId} className="srTile">
                  <div className="srVideo">
                    {stream ? (
                      <video
                        className="srVideoEl"
                        autoPlay
                        playsInline
                        muted={isMe}
                        ref={(el) => {
                          if (el) el.srcObject = stream;
                        }}
                      />
                    ) : (
                      <div className="srAvatar">
                        <img className="srAvatarImg" src={avatarIcon} alt="avatar" />
                      </div>
                    )}

                    <div className="srNamePill">
                      <div className="srNameBadge">{isMe ? "ME" : "U"}</div>
                      <div className="srNameNick">{p.userNickname}</div>
                    </div>
                  </div>

                  <div className="srBubbleWrap">
                    <button
                      className={`srBubble ${bubbleMap[p.studyParticipantId] ? "filled" : ""}`}
                      onClick={() => {
                        if (!isMe) return;

                        const next = prompt(
                          "지금 상태(STUDY/REST 등)",
                          bubbleMap[p.studyParticipantId] ?? ""
                        );
                        if (next == null) return;

                        if (typeof sendNowState === "function") {
                          sendNowState({
                            studyParticipantId: me.studyParticipantId,
                            nowState: next,
                          });
                        }

                        setBubbleMap((prev) => ({
                          ...prev,
                          [me.studyParticipantId]: next,
                        }));
                      }}
                    >
                      {bubbleMap[p.studyParticipantId] ?? ""}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== 채팅 ===== */}
        <div className="srSide">
          <div>
            <div className="srChatTitle">채팅</div>
            <div className="srChatCard">
              <div className="srChatBody">
                {chatMessages.map((m) => (
                  <div key={m.id} className={`srChatLine ${m.mine ? "mine" : ""}`}>
                    {!m.mine && <div className="srChatAvatar" />}
                    <div className="srChatBubble">
                      <div className="srChatNick">{m.nickname}</div>
                      <div className="srChatText">{m.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="srChatInputRow">
                <input
                  className="srChatInput"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSendChat()}
                  placeholder="메시지를 입력하세요"
                />
                <button className="srChatSend" onClick={onSendChat}>
                  전송
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 하단 ===== */}
      <div className="srDock">
        <div className="srDockInner">
          <div className="srDockCenter">
            <button
              className="srCtlIcon"
              onClick={() => ENABLE_WEBRTC && setCamOn((v: boolean) => !v)}
              disabled={!ENABLE_WEBRTC}
              style={!ENABLE_WEBRTC ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
            >
              <img src={camOn ? cameraIcon : cameraOffIcon} alt="camera" />
            </button>
            <button
              className="srCtlIcon"
              onClick={() => ENABLE_WEBRTC && setMicOn((v: boolean) => !v)}
              disabled={!ENABLE_WEBRTC}
              style={!ENABLE_WEBRTC ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
            >
              <img src={micOn ? micIcon : micOffIcon} alt="mic" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}