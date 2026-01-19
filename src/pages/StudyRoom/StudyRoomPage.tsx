import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./StudyRoomPage.css";

import avatarIcon from "../../assets/icons/Vector.svg";
import cameraIcon from "../../assets/icons/majesticons_camera-line.svg";
import cameraOffIcon from "../../assets/icons/majesticons_camera-line_no.svg";
import micIcon from "../../assets/icons/stash_mic-solid.svg";
import micOffIcon from "../../assets/icons/Frame 106.svg";

import { api } from "../../api/client";
import { exitStudy } from "../../api/studies";
import { useAuth } from "../../context/AuthContext";
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

  const { token } = useAuth();

  const [me, setMe] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [bubbleMap, setBubbleMap] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  /* ===================== 퇴장(중복 방지 + pagehide) ===================== */
  const exitCalledRef = useRef(false);

  const exitOnce = async () => {
    if (!numericStudyId) return;
    if (exitCalledRef.current) return;
    exitCalledRef.current = true;

    try {
      await exitStudy(numericStudyId, "STUDY");
    } catch (e) {
      console.log("exitStudy failed:", e);
    }
  };

  useEffect(() => {
    if (!numericStudyId) return;

    const onPageHide = () => {
      if (exitCalledRef.current) return;
      exitCalledRef.current = true;

      fetch(`/studies/${numericStudyId}/participating`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ type: "STUDY" }),
        keepalive: true,
      }).catch(() => {});
    };

    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [numericStudyId, token]);

  useEffect(() => {
    return () => {
      void exitOnce();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericStudyId]);

  /* ===================== 참가자 목록 초기 조회 ===================== */
  useEffect(() => {
    if (!numericStudyId) return;

    (async () => {
      try {
        const res = await api.get(`/studies/${numericStudyId}/participating/users`);
        const data = res.data.data;

        setMe(data.me);
        setParticipants(data.participants ?? []);
        setBubbleMap(data.participantNowStates ?? {});
      } catch {
        setError("스터디룸 입장 실패");
      }
    })();
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
  if (error) return <div className="srError">{error}</div>;
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

              const stream = isMe
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
            <button className="srCtlIcon" onClick={() => setCamOn((v: boolean) => !v)}>
              <img src={camOn ? cameraIcon : cameraOffIcon} alt="camera" />
            </button>
            <button className="srCtlIcon" onClick={() => setMicOn((v: boolean) => !v)}>
              <img src={micOn ? micIcon : micOffIcon} alt="mic" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}