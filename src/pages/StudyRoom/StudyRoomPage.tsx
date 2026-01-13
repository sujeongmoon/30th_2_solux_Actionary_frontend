import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWebRTCRoom } from "./useWebRTCRoom";
import "./StudyRoomPage.css";

import lampIcon from "../../assets/icons/hugeicons_study-lamp.svg";
import cameraIcon from "../../assets/icons/majesticons_camera-line.svg";
import cameraOffIcon from "../../assets/icons/majesticons_camera-line_no.svg";
import moonIcon from "../../assets/icons/solar_moon-sleep-linear.svg";
import micIcon from "../../assets/icons/stash_mic-solid.svg";
import micOffIcon from "../../assets/icons/Frame 106.svg";
import avatarIcon from "../../assets/icons/Vector.svg";

type Participant = {
  id: string;
  nickname: string;
  badge?: string;
};

type Mode = "STUDY" | "REST";

type ChatMsg = {
  id: string;
  mine: boolean;
  nickname: string;
  text: string;
};

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
  return <video ref={ref} autoPlay playsInline muted={!!muted} className="srVideoEl" />;
}

function PomoRing({
  remainSec,
  totalSec,
}: {
  remainSec: number;
  totalSec: number;
}) {
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;

  const r = 128;
  const stroke = 28; 
  const C = 2 * Math.PI * r;

  // 시간 줄수록 링 감소
  const p = totalSec <= 0 ? 0 : Math.max(0, Math.min(1, remainSec / totalSec));
  const dashoffset = C * (1 - p);

  const centerText = formatHMS(remainSec);

  // 0~55, 5분 단위
  const ticks = useMemo(() => {
    const arr = [];
    for (let m = 0; m <= 55; m += 5) arr.push(m);
    return arr;
  }, []);

  const tickR = r + 36;

  const pos = (idx: number, len: number) => {
    const deg = -90 + (360 * idx) / len;
    const rad = (deg * Math.PI) / 180;
    return {
      x: cx + tickR * Math.cos(rad),
      y: cy + tickR * Math.sin(rad),
    };
  };

  return (
    <div className="srPomoRingWrap">
      <div className="srPomoTopPill" />

      <div className="srPomoCardBox">
        <svg className="srPomoSvg" viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="pomoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff3b6a" />
              <stop offset="50%" stopColor="#ff6f61" />
              <stop offset="100%" stopColor="#ff9f5a" />
            </linearGradient>
          </defs>

          {ticks.map((m, i) => {
            const { x, y } = pos(i, ticks.length);
            return (
              <text
                key={m}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="srPomoTick"
              >
                {m}
              </text>
            );
          })}

          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,.12)"
            strokeWidth={stroke}
          />

          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="url(#pomoGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={dashoffset}
            style={{
              transform: "rotate(-90deg) scaleY(-1)",
              transformOrigin: `${cx}px ${cy}px`,
              transition: "stroke-dashoffset .3s linear",
            }}
          />

          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            className="srPomoTimeText"
          >
            {centerText}
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function StudyRoomPage() {
  const navigate = useNavigate();
  const { studyId } = useParams();

  const numericStudyId = useMemo(() => {
    const n = Number(studyId);
    return Number.isFinite(n) ? n : null;
  }, [studyId]);

  /** WebRTC */
  const roomId = String(studyId ?? "unknown-room");
  const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL ?? "http://localhost:3000";

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

  /** 패널 */
  const [panelOpen, setPanelOpen] = useState(true);

  /** participants */
  const participants: Participant[] = useMemo(() => {
    const list: Participant[] = [];
    const meId = myPeerId || "me";
    list.push({ id: meId, nickname: "나", badge: "0" });

    for (const rid of remoteIds) {
      list.push({
        id: rid,
        nickname: `사용자-${rid.slice(0, 4)}`,
        badge: "0",
      });
    }
    return list;
  }, [myPeerId, remoteIds]);
  const gridCols = panelOpen ? 2 : 3;

  const gridSize = panelOpen ? 4 : 6;
  const [gridPage, setGridPage] = useState(0);

  const gridMaxPage = useMemo(
    () => Math.max(0, Math.ceil(participants.length / gridSize) - 1),
    [participants.length, gridSize]
  );

  useEffect(() => {
    setGridPage((p) => Math.min(p, gridMaxPage));
  }, [gridMaxPage]);

  const gridSlice = useMemo(() => {
    const start = gridPage * gridSize;
    return participants.slice(start, start + gridSize);
  }, [participants, gridPage, gridSize]);

  /** 말풍선 */
  const [editingBubbleId, setEditingBubbleId] = useState<string | null>(null);
  const [bubbleDraft, setBubbleDraft] = useState("");
  const [bubbleMap, setBubbleMap] = useState<Record<string, string>>({});

  const startEditBubble = (id: string) => {
    setEditingBubbleId(id);
    setBubbleDraft(bubbleMap[id] ?? "");
  };

  const commitBubble = () => {
    if (!editingBubbleId) return;
    setBubbleMap((prev) => ({ ...prev, [editingBubbleId]: bubbleDraft }));
    setEditingBubbleId(null);
  };


  const POMO_TOTAL = 60 * 60;
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoRemainSec, setPomoRemainSec] = useState(POMO_TOTAL);
  const timerRef = useRef<number | null>(null);

  const togglePomo = () => setPomoRunning((v) => !v);
  const resetPomo = () => {
    setPomoRunning(false);
    setPomoRemainSec(POMO_TOTAL);
  };

  useEffect(() => {
    if (!pomoRunning) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = window.setInterval(() => {
      setPomoRemainSec((s) => Math.max(0, s - 1));
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [pomoRunning]);

  useEffect(() => {
    if (!pomoRunning) return;
    if (pomoRemainSec > 0) return;
    setPomoRunning(false);
  }, [pomoRemainSec, pomoRunning]);

  /** 공부/휴식 시간 */
  const [mode, setMode] = useState<Mode>("REST");
  const [studySec, setStudySec] = useState(0);
  const [restSec, setRestSec] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      if (mode === "STUDY") setStudySec((v) => v + 1);
      else setRestSec((v) => v + 1);
    }, 1000);
    return () => window.clearInterval(t);
  }, [mode]);

  /** Chat mock */
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { id: "m0", mine: false, nickname: "user-1234", text: "안녕!" },
  ]);

  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = chatBodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chatMessages.length]);

  const sendMockChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, mine: true, nickname: "나", text },
    ]);
    setChatInput("");
  };

  const leaveRoom = () => navigate("/studies");

  return (
    <div className="srWrap">
      {/* Top */}
      <div className="srTopBar">
        <div className="srRoomSub">studyId: {numericStudyId ?? "-"}</div>
        <button type="button" className="srLeaveBtn" onClick={leaveRoom}>
          나가기
        </button>
      </div>

      {/* Content */}
      <div className={`srContent ${panelOpen ? "panelOpen" : "panelClosed"}`}>
        {/* Grid */}
        <section className="srGridSection">
          {participants.length > gridSize && (
            <div className="srGridNav">
              <button
                type="button"
                className="srArrow"
                onClick={() => setGridPage((p) => Math.max(0, p - 1))}
                disabled={gridPage <= 0}
              >
                ‹
              </button>

              <div className="srGridHint">{`페이지 ${gridPage + 1} / ${gridMaxPage + 1}`}</div>

              <button
                type="button"
                className="srArrow"
                onClick={() => setGridPage((p) => Math.min(gridMaxPage, p + 1))}
                disabled={gridPage >= gridMaxPage}
              >
                ›
              </button>
            </div>
          )}

          <div className="srGrid" style={{ ["--cols" as any]: gridCols }}>
            {gridSlice.map((p) => {
              const isMe = p.id === (myPeerId || "me");
              const stream = isMe ? localStream : remoteStreams[p.id] ?? null;
              const cameraOn = isMe ? camOn : !!stream;
              const bubbleText = bubbleMap[p.id] ?? "";

              return (
                <div key={p.id} className="srTile">
                  <div className="srVideo">
                    {cameraOn ? (
                      <Video stream={stream} muted={isMe} />
                    ) : (
                      <div className="srAvatar" aria-label="camera off">
                        <img className="srAvatarImg" src={avatarIcon} alt="avatar" />
                      </div>
                    )}

                    <div className="srNamePill">
                      <span className="srNameBadge">{p.badge ?? "0"}</span>
                      <span className="srNameNick">{p.nickname}</span>
                    </div>
                  </div>

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
                        placeholder=""
                      />
                    ) : (
                      <button
                        type="button"
                        className={`srBubble ${bubbleText ? "filled" : ""}`}
                        onClick={() => startEditBubble(p.id)}
                      >
                        {bubbleText || " "}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Side panel */}
        {panelOpen && (
          <aside className="srSide">
            {/* Pomodoro */}
            <div className="srPomoCard">
              <div className="srPomoHeader">
                <div className="srPomoTitleRow">
                  <div className="srPomoTitle"> </div>
                  <div className="srPomoSub"> </div>
                </div>

                <div className="srPomoBtns">
                  <button type="button" className="srMiniBtn" onClick={togglePomo}>
                    {pomoRunning ? "일시정지" : "시작"}
                  </button>
                  <button type="button" className="srMiniBtn" onClick={resetPomo}>
                    리셋
                  </button>
                </div>
              </div>

              <PomoRing remainSec={pomoRemainSec} totalSec={POMO_TOTAL} />
            </div>

            {/* Chat */}
            <div className="srChatCard">
              <div className="srChatTitle">채팅</div>

              <div className="srChatBody" ref={chatBodyRef}>
                {chatMessages.map((m) => (
                  <div key={m.id} className={`srChatLine ${m.mine ? "mine" : "other"}`}>
                    {!m.mine && <div className="srChatAvatar" />}
                    <div className="srChatBubble">
                      {!m.mine && <div className="srChatNick">{m.nickname}</div>}
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMockChat();
                  }}
                  placeholder="채팅을 입력하세요"
                />
                <button type="button" className="srChatSend" onClick={sendMockChat}>
                  ↗
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* panel toggle */}
      <button
        type="button"
        className="srPanelToggle"
        onClick={() => setPanelOpen((v) => !v)}
        aria-label={panelOpen ? "패널 닫기" : "패널 열기"}
      >
        {panelOpen ? "›" : "‹"}
      </button>

      {/* Bottom Dock */}
      <div className="srDock">
        <div className="srDockInner">
          <div className="srTimePill">
            <img className="srPillIcon" src={moonIcon} alt="" />
            <span className="srPillLabel">쉬는 시간</span>
            <span className="srPillTime">{formatHMS(restSec)}</span>
          </div>

          <div className="srTimePill">
            <img className="srPillIcon" src={lampIcon} alt="" />
            <span className="srPillLabel">공부 시간</span>
            <span className="srPillTime">{formatHMS(studySec)}</span>
          </div>

          <div className="srDockCenter">
            <button type="button" className="srCtlMain" onClick={() => setMode("STUDY")} aria-label="공부 시작">
              ▶
            </button>
            <button type="button" className="srCtlMain" onClick={() => setMode("REST")} aria-label="휴식">
              ❚❚
            </button>
          </div>

          <div className="srDockRight">
          <button
            type="button"
            className={`srCtlIcon ${camOn ? "isOn" : "isOff"}`}
            onClick={() => setCamOn((v) => !v)}
            aria-label="camera"
            aria-pressed={!camOn}
          >
            <img src={camOn ? cameraIcon : cameraOffIcon} alt={camOn ? "camera on" : "camera off"} />
          </button>

          <button
            type="button"
            className={`srCtlIcon ${micOn ? "isOn" : "isOff"}`}
            onClick={() => setMicOn((v) => !v)}
            aria-label="mic"
            aria-pressed={!micOn}
          >
            <img src={micOn ? micIcon : micOffIcon} alt={micOn ? "mic on" : "mic off"} />
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}