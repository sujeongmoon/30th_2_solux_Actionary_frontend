import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWebRTCRoom } from "./useWebRTCRoom";
import "./StudyRoomPage.css";

type Participant = {
  id: string; 
  nickname: string;
  badge?: string;
  bubble: string; 
};

type Mode = "STUDY" | "REST";

/** hh:mm:ss */
function formatHMS(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function Video({ stream, muted }: { stream: MediaStream | null; muted?: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.srcObject = stream;
  }, [stream]);

  if (!stream) return null;

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={!!muted}
      className="srVideoEl"
    />
  );
}

export default function StudyRoomPage() {
  const navigate = useNavigate();
  const { studyId } = useParams();

  // ===== WebRTC (진짜 줌 화면) =====
  const roomId = String(studyId ?? "unknown-room");
  const SIGNALING_URL =
    import.meta.env.VITE_SIGNALING_URL ?? "http://localhost:3000";

  const {
    myPeerId,
    localStream,
    remoteStreams,
    remoteIds,
    camOn,
    micOn,
    setCamOn,
    setMicOn,
  } = useWebRTCRoom({
    roomId,
    signalingUrl: SIGNALING_URL,
    displayName: "나",
    enableVideo: true,
    enableAudio: true,
  });

  // ====== 명세: 기본 4명, 5명 이상이면 넘김(화살표) ======
  const gridSize = 4;
  const [gridPage, setGridPage] = useState(0);

  // 참가자 목록: (나 + remote들)
  const participants: Participant[] = useMemo(() => {
    const list: Participant[] = [];
  
    //소켓(myPeerId) 없어도 "나"는 항상 렌더되게
    const meId = myPeerId || "me";
  
    list.push({
      id: meId,
      nickname: "나",
      badge: "👑",
      bubble: "",
    });
  
    // 상대들(소켓 연결 성공 + remote stream 들어오면 생김)
    for (const rid of remoteIds) {
      list.push({
        id: rid,
        nickname: `사용자-${rid.slice(0, 4)}`,
        badge: "🏷️",
        bubble: "",
      });
    }
  
    return list;
  }, [myPeerId, remoteIds]);

  const gridMaxPage = useMemo(
    () => Math.max(0, Math.ceil(participants.length / gridSize) - 1),
    [participants.length]
  );

  useEffect(() => {
    // 인원 줄어서 현재 페이지가 범위를 벗어나면 보정
    setGridPage((p) => Math.min(p, gridMaxPage));
  }, [gridMaxPage]);

  const gridSlice = useMemo(() => {
    const start = gridPage * gridSize;
    return participants.slice(start, start + gridSize);
  }, [participants, gridPage]);

  // ====== 채팅창 토글 ======
  const [chatOpen, setChatOpen] = useState(true);

  // ====== 뽀모도로(UI만 자리) ======
  const [pomoEnabled] = useState(true);
  const [pomoRemainSec] = useState(25 * 60);

  // ====== 재생/멈춤(공부/휴식 시간 측정) ======
  const [mode, setMode] = useState<Mode>("REST");
  const [studySec, setStudySec] = useState(0);
  const [restSec, setRestSec] = useState(0);
  const tickRef = useRef<number | null>(null);

  const running = mode === "STUDY";

  useEffect(() => {
    if (tickRef.current) window.clearInterval(tickRef.current);

    tickRef.current = window.setInterval(() => {
      if (mode === "STUDY") setStudySec((v) => v + 1);
      else setRestSec((v) => v + 1);
    }, 1000);

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [mode]);

  // ====== 말풍선 (participants는 memo라 별도 map으로 관리) ======
  const [editingBubbleId, setEditingBubbleId] = useState<string | null>(null);
  const [bubbleDraft, setBubbleDraft] = useState("");
  const [bubbleMap, setBubbleMap] = useState<Record<string, string>>({});

  const startEditBubble = (p: Participant) => {
    setEditingBubbleId(p.id);
    setBubbleDraft(bubbleMap[p.id] ?? "");
  };

  const commitBubble = () => {
    if (!editingBubbleId) return;
    setBubbleMap((prev) => ({ ...prev, [editingBubbleId]: bubbleDraft }));
    setEditingBubbleId(null);
  };

  const leaveRoom = () => {
    navigate("/studies");
  };

  return (
    <div className="srWrap">
      {/* 상단 우측: 나가기 + 채팅 토글 */}
      <div className="srTopBar">
        <div className="srTopLeft">
          <div className="srRoomTitle"></div>
          <div className="srRoomSub">studyId: {studyId ?? "-"}</div>
        </div>

        <div className="srTopRight">
          <button
            type="button"
            className="srChatToggle"
            onClick={() => setChatOpen((v) => !v)}
            aria-label={chatOpen ? "채팅창 닫기" : "채팅창 열기"}
            title={chatOpen ? "채팅창 닫기" : "채팅창 열기"}
          >
            {chatOpen ? "›" : "‹"}
          </button>

          <button type="button" className="srLeaveBtn" onClick={leaveRoom}>
            나가기
          </button>
        </div>
      </div>

      {/* 본문: 좌(캠그리드) + 우(채팅/뽀모도로) */}
      <div className={`srMain ${chatOpen ? "" : "chatClosed"}`}>
        {/* ====== 캠 그리드 ====== */}
        <section className="srGridSection">
          <div className="srGridNav">
            <button
              type="button"
              className="srArrow"
              onClick={() => setGridPage((p) => Math.max(0, p - 1))}
              disabled={gridPage <= 0}
            >
              ‹
            </button>

            <div className="srGridHint">
              {participants.length <= 4
                ? "기본 4명 표시"
                : `페이지 ${gridPage + 1} / ${gridMaxPage + 1}`}
            </div>

            <button
              type="button"
              className="srArrow"
              onClick={() => setGridPage((p) => Math.min(gridMaxPage, p + 1))}
              disabled={gridPage >= gridMaxPage}
            >
              ›
            </button>
          </div>

          <div className="srGrid">
            {gridSlice.map((p) => {
              const isMe = p.id === myPeerId;
              const stream = isMe ? localStream : remoteStreams[p.id] ?? null;

              // 내 카메라 상태는 camOn, 상대는 stream 유무로 표시(최소 구현)
              const cameraOn = isMe ? camOn : !!stream;

              const bubbleText = bubbleMap[p.id] ?? "";

              return (
                <div key={p.id} className="srTile">
                  {/* 캠 영역 */}
                  <div className="srVideo">
                    {cameraOn ? (
                      <Video stream={stream} muted={isMe} />
                    ) : (
                      <div className="srAvatar" aria-label="camera off">
                        <div className="srAvatarIcon">👤</div>
                      </div>
                    )}

                    {/* 닉네임/뱃지 */}
                    <div className="srNamePill">
                      <span className="srBadge">{p.badge ?? "🏷️"}</span>
                      <span className="srNick">{p.nickname}</span>
                    </div>
                  </div>

                  {/* 말풍선 */}
                  <div className="srBubbleWrap">
                    {editingBubbleId === p.id ? (
                      <input
                        className="srBubbleInput"
                        value={bubbleDraft}
                        onChange={(e) => setBubbleDraft(e.target.value)}
                        onBlur={commitBubble}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitBubble();
                          if (e.key === "Escape") setEditingBubbleId(null);
                        }}
                        autoFocus
                        placeholder="메시지 입력…"
                      />
                    ) : (
                      <button
                        type="button"
                        className={`srBubble ${bubbleText ? "filled" : "empty"}`}
                        onClick={() => startEditBubble(p)}
                        title="클릭해서 입력"
                      >
                        {bubbleText ? bubbleText : " "}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 하단 컨트롤바 */}
          <div className="srDock">
            <div className="srTimePill">
              <span className="srTimeLabel">쉬는 시간</span>
              <span className="srTimeValue">{formatHMS(restSec)}</span>
            </div>

            <div className="srTimePill">
              <span className="srTimeLabel">공부 시간</span>
              <span className="srTimeValue">{formatHMS(studySec)}</span>
            </div>

            <div className="srControls">
              <button
                type="button"
                className={`srCtlBtn ${running ? "off" : "on"}`}
                onClick={() => setMode("STUDY")}
                aria-label="재생"
                title="재생(공부 시작)"
              >
                ▶
              </button>

              <button
                type="button"
                className={`srCtlBtn ${running ? "on" : "off"}`}
                onClick={() => setMode("REST")}
                aria-label="멈춤"
                title="멈춤(휴식 시작)"
              >
                ❚❚
              </button>

              <button
                type="button"
                className={`srCtlMini ${camOn ? "on" : "off"}`}
                onClick={() => setCamOn((v) => !v)}
                title="카메라"
              >
                📷
              </button>

              <button
                type="button"
                className={`srCtlMini ${micOn ? "on" : "off"}`}
                onClick={() => setMicOn((v) => !v)}
                title="마이크"
              >
                🎙
              </button>
            </div>
          </div>
        </section>

        {/* ====== 채팅/뽀모도로 패널 ====== */}
        {chatOpen && (
          <aside className="srSide">
            {pomoEnabled && (
              <div className="srPomoCard">
                <div className="srPomoTitle">뽀모도로</div>
                <div className="srPomoCircle" aria-label="pomodoro">
                  <div className="srPomoTime">{formatHMS(pomoRemainSec)}</div>
                </div>
                <div className="srPomoHint">※ 뽀모도로는 후순위(지금은 UI만)</div>
              </div>
            )}

            <div className="srChatCard">
              <div className="srChatTitle">채팅</div>

              <div className="srChatBody">
                <div className="srChatMsg">
                  <span className="srChatNick">시스템</span>
                  <span className="srChatText">WebRTC 연결 중…</span>
                </div>
              </div>

              <div className="srChatInputRow">
                <input className="srChatInput" placeholder="메시지 입력…" />
                <button className="srChatSend" type="button">
                  ↗
                </button>
              </div>

              <div className="srChatHint">※채팅은 UI Mock</div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}