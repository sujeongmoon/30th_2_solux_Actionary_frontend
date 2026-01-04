import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./StudyRoomPage.css";

type Participant = {
  id: number;
  nickname: string;
  badge?: string; // 업적(뱃지) 텍스트/아이콘 자리
  cameraOn: boolean;
  micOn: boolean;
  bubble: string; // 말풍선 텍스트
  coverImage?: string | null; // 캠 대신 썸네일(임시)
};

type Mode = "STUDY" | "REST";

/** mm:ss:ms 느낌이 아니라, 명세대로 시/분/초 표시 */
function formatHMS(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

const MOCK_PARTICIPANTS: Participant[] = [
  {
    id: 1,
    nickname: "눈송이다",
    badge: "🏅",
    cameraOn: true,
    micOn: true,
    bubble: "",
    coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200",
  },
  {
    id: 2,
    nickname: "배곱파",
    badge: "🔥",
    cameraOn: false,
    micOn: true,
    bubble: "",
    coverImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200",
  },
  {
    id: 3,
    nickname: "공부중",
    badge: "🎯",
    cameraOn: true,
    micOn: false,
    bubble: "",
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200",
  },
  {
    id: 4,
    nickname: "잠깐만",
    badge: "🧠",
    cameraOn: false,
    micOn: false,
    bubble: "",
    coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200",
  },
  // 5명 이상 테스트용(페이지 넘김 확인)
  {
    id: 5,
    nickname: "추가유저",
    badge: "⭐️",
    cameraOn: true,
    micOn: true,
    bubble: "안녕하세요",
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200",
  },
];

export default function StudyRoomPage() {
  const navigate = useNavigate();
  const { studyId } = useParams();

  // ====== 명세: 기본 4명, 5명 이상이면 넘김(화살표) ======  [oai_citation:1‡스터디접속.pdf](sediment://file_00000000e5c87207982f8320d73dc33e)
  const [participants, setParticipants] = useState<Participant[]>(MOCK_PARTICIPANTS);
  const [gridPage, setGridPage] = useState(0);
  const gridSize = 4;

  const gridMaxPage = useMemo(
    () => Math.max(0, Math.ceil(participants.length / gridSize) - 1),
    [participants.length]
  );

  const gridSlice = useMemo(() => {
    const start = gridPage * gridSize;
    return participants.slice(start, start + gridSize);
  }, [participants, gridPage]);

  // ====== 채팅창 토글(오른쪽 상단 화살표로 닫힘/열림) ======  [oai_citation:2‡스터디접속.pdf](sediment://file_00000000e5c87207982f8320d73dc33e)
  const [chatOpen, setChatOpen] = useState(true);

  // ====== 뽀모도로: 후순위(UI만 자리) ======  [oai_citation:3‡스터디접속.pdf](sediment://file_00000000e5c87207982f8320d73dc33e)
  const [pomoEnabled] = useState(true);
  const [pomoRemainSec] = useState(25 * 60); // 임시

  // ====== 재생/멈춤(공부/휴식 시간 측정) ======  [oai_citation:4‡스터디접속.pdf](sediment://file_00000000e5c87207982f8320d73dc33e)
  const [mode, setMode] = useState<Mode>("REST");
  const [studySec, setStudySec] = useState(0);
  const [restSec, setRestSec] = useState(0);
  const tickRef = useRef<number | null>(null);

  const running = mode === "STUDY";

  useEffect(() => {
    // 1초마다 증가
    if (tickRef.current) window.clearInterval(tickRef.current);

    tickRef.current = window.setInterval(() => {
      if (mode === "STUDY") setStudySec((v) => v + 1);
      else setRestSec((v) => v + 1);
    }, 1000);

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [mode]);

  // ====== 내 카메라/마이크 토글(줌/Jitsi와 동일하게 토글 UI만) ======  [oai_citation:5‡스터디접속.pdf](sediment://file_00000000e5c87207982f8320d73dc33e)
  const [myCam, setMyCam] = useState(true);
  const [myMic, setMyMic] = useState(true);

  // ====== 말풍선: 클릭하면 입력 가능, 비면 빈 상태 유지 ======  [oai_citation:6‡스터디접속.pdf](sediment://file_00000000e5c87207982f8320d73dc33e)
  const [editingBubbleId, setEditingBubbleId] = useState<number | null>(null);
  const [bubbleDraft, setBubbleDraft] = useState("");

  const startEditBubble = (p: Participant) => {
    setEditingBubbleId(p.id);
    setBubbleDraft(p.bubble ?? "");
  };

  const commitBubble = () => {
    if (editingBubbleId == null) return;
    setParticipants((prev) =>
      prev.map((p) => (p.id === editingBubbleId ? { ...p, bubble: bubbleDraft } : p))
    );
    setEditingBubbleId(null);
  };

  const leaveRoom = () => {
    // 명세: 나가기 누르면 스터디 전체 페이지로 이동  [oai_citation:7‡스터디접속.pdf](sediment://file_00000000e5c87207982f8320d73dc33e)
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
            {gridSlice.map((p) => (
              <div key={p.id} className="srTile">
                {/* 캠 영역 */}
                <div className="srVideo">
                  {/* 카메라 껐을 때 기본 사람 이미지 삽입(명세) */} {/*  [oai_citation:8‡스터디접속.pdf](sediment://file_00000000e5c87207982f8320d73dc33e) */}
                  {p.cameraOn ? (
                    p.coverImage ? (
                      <img className="srThumbImg" src={p.coverImage} alt="" />
                    ) : (
                      <div className="srThumbFallback" />
                    )
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
                      className={`srBubble ${p.bubble ? "filled" : "empty"}`}
                      onClick={() => startEditBubble(p)}
                      title="클릭해서 입력"
                    >
                      {p.bubble ? p.bubble : " "}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 하단 컨트롤바: 공부/휴식 시간 + 재생/멈춤 + 카메라/마이크 */} {/*  [oai_citation:9‡스터디접속.pdf](sediment://file_00000000e5c87207982f8320d73dc33e) */}
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
                className={`srCtlMini ${myCam ? "on" : "off"}`}
                onClick={() => setMyCam((v) => !v)}
                title="카메라"
              >
                📷
              </button>

              <button
                type="button"
                className={`srCtlMini ${myMic ? "on" : "off"}`}
                onClick={() => setMyMic((v) => !v)}
                title="마이크"
              >
                🎙
              </button>
            </div>
          </div>
        </section>

        {/* ====== 채팅/뽀모도로 패널(채팅 닫으면 숨김) ====== */}
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
                  <span className="srChatNick">눈송이다</span>
                  <span className="srChatText">화이팅!</span>
                </div>
                <div className="srChatMsg">
                  <span className="srChatNick">배곱파</span>
                  <span className="srChatText">오늘 목표 뭐야?</span>
                </div>
              </div>

              <div className="srChatInputRow">
                <input className="srChatInput" placeholder="메시지 입력…" />
                <button className="srChatSend" type="button">
                  ↗
                </button>
              </div>

              <div className="srChatHint">
                ※채팅은 UI Mock
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}