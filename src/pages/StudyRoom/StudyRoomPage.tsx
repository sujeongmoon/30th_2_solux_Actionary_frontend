import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./StudyRoomPage.css";

import avatarIcon from "../../assets/icons/Vector.svg";
import cameraIcon from "../../assets/icons/majesticons_camera-line.svg";
import cameraOffIcon from "../../assets/icons/majesticons_camera-line_no.svg";
import micIcon from "../../assets/icons/stash_mic-solid.svg";
import micOffIcon from "../../assets/icons/Frame 106.svg";

import { api } from "../../api/client";
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

/* ===================== 컴포넌트 ===================== */

export default function StudyRoomPage() {
  const navigate = useNavigate();
  const { studyId } = useParams();
  const numericStudyId = Number(studyId);
  const [me, setMe] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [bubbleMap, setBubbleMap] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

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
  });

  /* ===================== 채팅 ===================== */
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const lastEventRef = useRef(0);

  useEffect(() => {
    if (!me) return;
    if (events.length <= lastEventRef.current) return;

    const last = events[events.length - 1];
    lastEventRef.current = events.length;
    const d = last.data;

    switch (last.type) {
      case "CHAT_MESSAGE": {
        setChatMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            mine: d.studyParticipantId === me.studyParticipantId,
            nickname: d.userNickname,
            text: d.chatMessage,
          },
        ]);
        break;
      }

      case "NOW_STATE_CHANGED": {
        setBubbleMap((prev) => ({
          ...prev,
          [d.studyParticipantId]: d.nowState,
        }));
        break;
      }

      case "PARTICIPANT_JOINED": {
        setParticipants((prev) => [...prev, d]);
        break;
      }

      case "PARTICIPANT_LEFT": {
        setParticipants((prev) =>
          prev.filter((p) => p.studyParticipantId !== d.studyParticipantId)
        );
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
    camOn,
    micOn,
    setCamOn,
    setMicOn,
  } = useWebRTCRoom({
    roomId: String(studyId),
    signalingUrl: import.meta.env.VITE_SIGNALING_URL,
    displayName: me?.userNickname ?? "나",
  });

  /* ===================== 렌더 ===================== */

  if (error) return <div className="srError">{error}</div>;
  if (!me) return <div className="srLoading">입장 중...</div>;

  return (
    <div className="srWrap">
      {/* ===== 상단 ===== */}
      <div className="srTopBar">
        <span>Study #{studyId}</span>
        <button onClick={() => navigate("/studies")}>나가기</button>
      </div>

      {/* ===== 본문 ===== */}
      <div className="srContent">
        {/* ===== 참가자 ===== */}
        <div className="srGrid">
          {[me, ...participants].map((p) => {
            const isMe = p.studyParticipantId === me.studyParticipantId;
            const stream = isMe ? localStream : null; // WebRTC 매핑은 후속 단계

            return (
              <div key={p.studyParticipantId} className="srTile">
                {stream ? (
                  <video
                    autoPlay
                    playsInline
                    muted={isMe}
                    ref={(el) => el && (el.srcObject = stream)}
                  />
                ) : (
                  <img src={avatarIcon} alt="avatar" />
                )}

                <div className="srName">{p.userNickname}</div>

                <button
                  className="srBubble"
                  onClick={() => {
                    if (!isMe) return;
                    const next = prompt(
                      "지금 상태",
                      bubbleMap[p.studyParticipantId] ?? ""
                    );
                    if (next == null) return;

                    sendNowState({
                      studyParticipantId: me.studyParticipantId,
                      nowState: next,
                    });

                    setBubbleMap((prev) => ({
                      ...prev,
                      [me.studyParticipantId]: next,
                    }));
                  }}
                >
                  {bubbleMap[p.studyParticipantId] ?? ""}
                </button>
              </div>
            );
          })}
        </div>

        {/* ===== 채팅 ===== */}
        <div className="srChat">
          <div className="srChatBody" ref={chatBodyRef}>
            {chatMessages.map((m) => (
              <div key={m.id} className={m.mine ? "mine" : "other"}>
                <b>{m.nickname}</b>: {m.text}
              </div>
            ))}
          </div>

          <div className="srChatInput">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSendChat()}
            />
            <button onClick={onSendChat}>전송</button>
          </div>
        </div>
      </div>

      {/* ===== 하단 ===== */}
      <div className="srDock">
        <button onClick={() => setCamOn((v) => !v)}>
          <img src={camOn ? cameraIcon : cameraOffIcon} />
        </button>
        <button onClick={() => setMicOn((v) => !v)}>
          <img src={micOn ? micIcon : micOffIcon} />
        </button>
      </div>
    </div>
  );
}