import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// 훅 가져오기 (파일명이 맞는지 확인해주세요)
import { useWebRTCRoom } from "./useWebRTCRoom";
import { useStompChat } from "./useStompChat";

// API (기존에 쓰시던 것)
import { enterPublicStudy, exitStudy, updateNowState } from "../../api/studies";
import "./StudyRoomPage.css";

// 아이콘 (경로 확인 필요)
import lampIcon from "../../assets/icons/hugeicons_study-lamp.svg";
import cameraIcon from "../../assets/icons/majesticons_camera-line.svg";
import cameraOffIcon from "../../assets/icons/majesticons_camera-line_no.svg";
import moonIcon from "../../assets/icons/solar_moon-sleep-linear.svg";
import micIcon from "../../assets/icons/stash_mic-solid.svg";
import micOffIcon from "../../assets/icons/Frame 106.svg";
import avatarIcon from "../../assets/icons/Vector.svg";

/* ===================== 타입 정의 ===================== */
type Participant = {
  id: string; 
  userId: number; 
  nickname: string;
  badgeId: number;
  badgeImageUrl: string | null;
  profileImageUrl?: string | null;
  isMe: boolean;
  studyParticipantId: number;
};

type Mode = "STUDY" | "REST";

type ChatMsg = {
  id: string;
  mine: boolean;
  nickname: string;
  text: string;
};

/* ===================== 유틸리티 & 컴포넌트 ===================== */
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

function PomoRing({ remainSec, totalSec }: { remainSec: number; totalSec: number }) {
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const r = 128;
  const stroke = 28;
  const C = 2 * Math.PI * r;
  const p = totalSec <= 0 ? 0 : Math.max(0, Math.min(1, remainSec / totalSec));
  const dashoffset = C * (1 - p);
  const centerText = formatHMS(remainSec);

  const ticks = useMemo(() => {
    const arr = [];
    for (let m = 0; m <= 55; m += 5) arr.push(m);
    return arr;
  }, []);

  const tickR = r + 36;
  const pos = (idx: number, len: number) => {
    const deg = -90 + (360 * idx) / len;
    const rad = (deg * Math.PI) / 180;
    return { x: cx + tickR * Math.cos(rad), y: cy + tickR * Math.sin(rad) };
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
              <text key={m} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="srPomoTick">
                {m}
              </text>
            );
          })}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={stroke} />
          <circle
            cx={cx} cy={cy} r={r} fill="none" stroke="url(#pomoGrad)" strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={dashoffset}
            style={{
              transform: "rotate(-90deg) scaleY(-1)",
              transformOrigin: `${cx}px ${cy}px`,
              transition: "stroke-dashoffset .3s linear",
            }}
          />
          <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle" className="srPomoTimeText">
            {centerText}
          </text>
        </svg>
      </div>
    </div>
  );
}

/* ===================== 메인 페이지 ===================== */
export default function StudyRoomPage() {
  const navigate = useNavigate();
  const { studyId } = useParams();
  const numericStudyId = Number(studyId);

  // 환경변수 (없을 경우 하드코딩된 값 사용)
  const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL ?? "http://13.209.205.33:8080";

  // 상태 관리
  const [me, setMe] = useState<Participant | null>(null);
  const [others, setOthers] = useState<Participant[]>([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 기능 상태
  const [bubbleMap, setBubbleMap] = useState<Record<string, string>>({});
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  
  // Refs
  const lastEventRef = useRef(0);
  const joinedRef = useRef(false);
  const exitCalledRef = useRef(false);

  // 1. STOMP 연결 (채팅 + 화상 신호 통로)
  const { 
    connected,      // 소켓 연결 여부
    events,         // 들어온 메시지 목록 (채팅, 입장, 화상 신호 등)
    sendChat,       // 채팅 보내기 함수
    sendNowState,   // 말풍선 변경 함수
    sendSignaling,  // 화상 신호 보내기 함수
  } = useStompChat({
    studyId: numericStudyId,
    wsBaseUrl: WS_BASE_URL,
  });

  // 2. WebRTC 연결 (STOMP 기능 사용)
  const { 
    localStream, 
    remoteStreams, 
    camOn, 
    micOn, 
    setCamOn, 
    setMicOn 
  } = useWebRTCRoom({
    enabled: !!me && connected, // 내 정보가 있고 소켓이 연결되면 시작
    userId: me?.userId,
    events: events,             // 소켓으로 받은 메시지를 넘겨줌
    sendSignaling: sendSignaling // 소켓으로 보내는 함수를 넘겨줌
  }) as any;


  /* ===================== 3. 입장 및 데이터 조회 ===================== */
  useEffect(() => {
    if (!numericStudyId) return;
    
    let mounted = true;

    (async () => {
      try {
        setError(null);
        
        const token = localStorage.getItem("accessToken") || "";
        const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://13.209.205.33:8080/api";
        const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
        const usersUrl = `${baseUrl}/studies/${numericStudyId}/participating/users`;

        // 3-1. 선 조회 -> 실패 시 입장 -> 재조회 (403 방지)
        let response = await fetch(usersUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json", "Authorization": authHeader },
        });

        if (response.status === 403 || response.status === 401) {
            console.log("⚠️ 미참여 상태. 공개 입장 시도...");
            try {
                await enterPublicStudy(numericStudyId);
                // 입장 성공 후 다시 조회
                response = await fetch(usersUrl, {
                    method: "GET",
                    headers: { "Content-Type": "application/json", "Authorization": authHeader },
                });
            } catch (joinErr: any) {
                console.error("입장 실패:", joinErr);
                const msg = joinErr?.response?.data?.message || "";
                if (msg.includes("정원")) setError("정원 초과");
                else setError("입장에 실패했습니다.");
                return;
            }
        }

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const res = await response.json();
        const data = res.data;

        if (!mounted || !data) return;

        // 3-2. 내 정보 설정
        if (data.me) {
          const m = data.me;
          setMe({
            id: String(m.studyParticipantId),
            userId: m.userId,
            studyParticipantId: m.studyParticipantId,
            nickname: m.userNickname,
            profileImageUrl: m.profileImageUrl,
            badgeId: m.badgeId ?? 0,
            badgeImageUrl: m.badgeImageUrl ?? null,
            isMe: true,
          });
        } else {
           setError("내 정보를 불러오지 못했습니다.");
           return;
        }

        // 3-3. 다른 참여자 설정
        const rawList = data.participatingUsers ?? [];
        const mappedList: Participant[] = rawList
          .filter((p: any) => p.userId !== data.me.userId)
          .map((p: any) => ({
             id: String(p.studyParticipantId),
             userId: p.userId,
             studyParticipantId: p.studyParticipantId,
             nickname: p.userNickname,
             profileImageUrl: p.profileImageUrl,
             badgeId: p.badgeId ?? 0,
             badgeImageUrl: p.badgeImageUrl ?? null,
             isMe: false,
          }));

        setOthers(mappedList);

        // 3-4. 말풍선 초기값 설정
        if (data.participantNowStates) {
            const initialBubbles: Record<string, string> = {};
            Object.keys(data.participantNowStates).forEach(key => {
                initialBubbles[key] = data.participantNowStates[key];
            });
            setBubbleMap(initialBubbles);
        }

        joinedRef.current = true;

      } catch (e: any) {
        if (!mounted) return;
        console.error("데이터 조회 실패", e);
        setError("데이터 로딩 실패");
      }
    })();

    return () => { mounted = false; };
  }, [numericStudyId]);

  /* ===================== 4. 그리드 & 페이지네이션 ===================== */
  const allParticipants = useMemo(() => {
    if (!me) return [];
    return [me, ...others];
  }, [me, others]);

  const gridCols = panelOpen ? 2 : 3;
  const gridSize = panelOpen ? 4 : 6;
  const [gridPage, setGridPage] = useState(0);

  const gridMaxPage = useMemo(
    () => Math.max(0, Math.ceil(allParticipants.length / gridSize) - 1),
    [allParticipants.length, gridSize]
  );

  useEffect(() => {
    setGridPage((p) => Math.min(p, gridMaxPage));
  }, [gridMaxPage]);

  const gridSlice = useMemo(() => {
    const start = gridPage * gridSize;
    return allParticipants.slice(start, start + gridSize);
  }, [allParticipants, gridPage, gridSize]);

  /* ===================== 5. STOMP 이벤트 처리 (채팅 & 말풍선) ===================== */
  // * 화상 신호 처리는 useWebRTCRoom 내부에서 하므로 여기선 채팅만 필터링해서 보여줍니다.
  useEffect(() => {
    if (!me || !events) return;
    
    // 이미 처리한 이벤트 인덱스 이후부터 확인 (간단한 로직)
    // 실제로는 이벤트 ID 등으로 중복 방지하면 더 좋습니다.
    const newEvents = events.slice(lastEventRef.current);
    if (newEvents.length === 0) return;

    lastEventRef.current = events.length;

    newEvents.forEach((evt: any) => {
        // (A) 채팅 메시지
        if (evt.type === "CHAT_MESSAGE") {
            const d = evt.data;
            setChatMessages((prev) => [
              ...prev,
              {
                id: String(Date.now()) + Math.random(),
                mine: Number(d.senderId) === me.userId, 
                nickname: d.senderNickname || "알 수 없음",
                text: d.chat || "",
              },
            ]);
        } 
        // (B) 말풍선(상태) 변경
        else if (evt.type === "NOW_STATE_CHANGED") {
            const d = evt.data;
            const spId = String(d.studyParticipantId);
            if (spId) {
                setBubbleMap((prev) => ({ ...prev, [spId]: d.nowState || "" }));
            }
        }
    });
  }, [events, me]);

  /* ===================== 6. 기능 핸들러 ===================== */
  const leaveRoom = async () => {
    if (numericStudyId && joinedRef.current && !exitCalledRef.current) {
        exitCalledRef.current = true;
        try { await exitStudy(numericStudyId, "STUDY"); } catch(e) {}
    }
    navigate("/studies");
  };

  const sendRealChat = () => {
    const text = chatInput.trim();
    if (!text || !me) return;
    sendChat(me.userId, text); // STOMP로 전송
    setChatInput("");
  };

  const [editingBubbleId, setEditingBubbleId] = useState<string | null>(null);
  const [bubbleDraft, setBubbleDraft] = useState("");

  const startEditBubble = (id: string) => {
    setEditingBubbleId(id);
    setBubbleDraft(bubbleMap[id] ?? "");
  };

  const commitBubble = async () => {
    if (!editingBubbleId || !me) return;
    
    if (editingBubbleId === String(me.studyParticipantId)) {
        try {
            await updateNowState(numericStudyId, bubbleDraft);
            // 내 화면엔 즉시 반영
            setBubbleMap((prev) => ({ ...prev, [editingBubbleId]: bubbleDraft }));
            // 소켓 전송 (옵션, API가 알아서 쏘면 생략 가능)
            sendNowState({ studyParticipantId: me.studyParticipantId, nowState: bubbleDraft });
        } catch (e) {
            console.error("말풍선 변경 실패:", e);
        }
    }
    setEditingBubbleId(null);
  };

  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = chatBodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatMessages.length]);

  /* ===================== 7. 타이머 (뽀모도로) ===================== */
  const POMO_TOTAL = 60 * 60;
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoRemainSec, setPomoRemainSec] = useState(POMO_TOTAL);
  const timerRef = useRef<number | null>(null);

  const togglePomo = () => setPomoRunning((v) => !v);
  const resetPomo = () => { setPomoRunning(false); setPomoRemainSec(POMO_TOTAL); };

  useEffect(() => {
    if (!pomoRunning) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }
    timerRef.current = window.setInterval(() => setPomoRemainSec((s) => Math.max(0, s - 1)), 1000);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [pomoRunning]);

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

  /* ===================== 렌더링 ===================== */
  if (error) return <div className="srError" style={{padding:40, color:'white'}}>{error} <button onClick={leaveRoom}>나가기</button></div>;
  if (!me) return <div className="srLoading">입장 중...</div>;

  return (
    <div className="srWrap">
      <div className="srTopBar">
        <div className="srRoomSub">Study #{numericStudyId ?? "-"}</div>
        <button type="button" className="srLeaveBtn" onClick={leaveRoom}>나가기</button>
      </div>

      <div className={`srContent ${panelOpen ? "panelOpen" : "panelClosed"}`}>
        <section className="srGridSection">
          {allParticipants.length > gridSize && (
            <div className="srGridNav">
              <button type="button" className="srArrow" onClick={() => setGridPage(p => Math.max(0, p-1))} disabled={gridPage<=0}>‹</button>
              <div className="srGridHint">{`페이지 ${gridPage + 1} / ${gridMaxPage + 1}`}</div>
              <button type="button" className="srArrow" onClick={() => setGridPage(p => Math.min(gridMaxPage, p+1))} disabled={gridPage>=gridMaxPage}>›</button>
            </div>
          )}

          <div className="srGrid" style={{ ["--cols" as any]: gridCols }}>
            {gridSlice.map((p) => {
              // WebRTC 스트림 매칭
              const stream = p.isMe ? localStream : (remoteStreams[p.userId] ?? null);
              const cameraOn = p.isMe ? camOn : !!stream; 
              
              const bubbleText = bubbleMap[p.id] ?? "";
              const profileImg = p.profileImageUrl || avatarIcon;

              return (
                <div key={p.id} className="srTile">
                  <div className="srVideo">
                    {cameraOn && stream ? (
                      <Video stream={stream as MediaStream} muted={p.isMe} />
                    ) : (
                      <div className="srAvatar">
                        <img className="srAvatarImg" src={profileImg} alt="avatar" onError={(e) => e.currentTarget.src = avatarIcon} />
                      </div>
                    )}

                    <div className="srNamePill">
                        {p.badgeImageUrl && (
                          <img 
                            src={p.badgeImageUrl} 
                            alt="badge" 
                            style={{ width: 28, height: 28, marginRight: 8, objectFit: 'contain' }} 
                          />
                        )}
                      <span className="srNameNick">{p.nickname}</span>
                    </div>
                  </div>

                  <div className="srBubbleWrap">
                    {p.isMe && editingBubbleId === p.id ? (
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
                      />
                    ) : (
                      <button
                        type="button"
                        className={`srBubble ${bubbleText ? "filled" : ""}`}
                        onClick={() => { if(p.isMe) startEditBubble(p.id); }}
                        style={{cursor: p.isMe ? 'pointer' : 'default'}}
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

        {panelOpen && (
          <aside className="srSide">
            <div className="srPomoCard">
              <div className="srPomoHeader">
                <div className="srPomoTitleRow"></div>
                <div className="srPomoBtns">
                  <button type="button" className="srMiniBtn" onClick={togglePomo}>{pomoRunning ? "일시정지" : "시작"}</button>
                  <button type="button" className="srMiniBtn" onClick={resetPomo}>리셋</button>
                </div>
              </div>
              <PomoRing remainSec={pomoRemainSec} totalSec={POMO_TOTAL} />
            </div>

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
                  onKeyDown={(e) => { if (e.key === "Enter") sendRealChat(); }}
                  placeholder="채팅을 입력하세요"
                />
                <button type="button" className="srChatSend" onClick={sendRealChat}>↗</button>
              </div>
            </div>
          </aside>
        )}
      </div>

      <button type="button" className="srPanelToggle" onClick={() => setPanelOpen((v) => !v)}>{panelOpen ? "›" : "‹"}</button>

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
            <button type="button" className="srCtlMain" onClick={() => setMode("STUDY")}>▶</button>
            <button type="button" className="srCtlMain" onClick={() => setMode("REST")}>❚❚</button>
          </div>
          <div className="srDockRight">
            <button type="button" className={`srCtlIcon ${camOn ? "isOn" : "isOff"}`} onClick={() => setCamOn((v) => !v)}>
                <img src={camOn ? cameraIcon : cameraOffIcon} alt="cam" />
            </button>
            <button type="button" className={`srCtlIcon ${micOn ? "isOn" : "isOff"}`} onClick={() => setMicOn((v) => !v)}>
                <img src={micOn ? micIcon : micOffIcon} alt="mic" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}