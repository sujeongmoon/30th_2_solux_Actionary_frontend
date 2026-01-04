import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./StudyViewModal.css";

// ===== 타입(목업용) =====
export type RankRow = {
  rank: number;
  nickname: string;
  dailyMinutes?: number | null; // 당일 미참여면 null 가능
  totalMinutes: number;
};

export type StudyViewData = {
  studyId: number;
  studyName: string;
  description?: string | null;
  guide?: string | null; // 안내(선택)
  coverImage?: string | null;

  categoryLabel?: string; // "공무원" 등
  isPublic?: boolean;

  liveCount: number; // 실시간 참여자 수
  limit: number; // 제한 인원

  rankingDaily: RankRow[];
  rankingTotal: RankRow[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  data: StudyViewData | null;
};

// ✅ 로고 경로(임의): 나중에 파일만 넣으면 됨
// 예: public/actionary-logo.png 로 두면 "/actionary-logo.png" 로 바꾸는 게 제일 편해
const FALLBACK_LOGO_SRC = "/actionary-logo.png";

const FAVORITE_KEY = "favoriteStudyIds";

function getFavorites(): number[] {
  try {
    const raw = localStorage.getItem(FAVORITE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}
function setFavorites(ids: number[]) {
  localStorage.setItem(FAVORITE_KEY, JSON.stringify(ids));
}

function mmToHourMin(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}분`;
  return `${h}시간 ${m}분`;
}

export default function StudyViewModal({ open, onClose, data }: Props) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState<"daily" | "total">("daily");
  const [favIds, setFavIds] = useState<number[]>(() => getFavorites());

  const isFav = useMemo(() => {
    if (!data) return false;
    return favIds.includes(data.studyId);
  }, [favIds, data]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setMenuOpen(false);
    setTab("daily");
  }, [open]);

  if (!open || !data) return null;

  const canJoin = data.liveCount < data.limit;
  const rows = tab === "daily" ? data.rankingDaily : data.rankingTotal;

  const onToggleFav = () => {
    const next = isFav ? favIds.filter((id) => id !== data.studyId) : [...favIds, data.studyId];
    setFavIds(next);
    setFavorites(next);
  };

  // ✅ 경로는 가정: 입장 페이지
  const onEnter = () => {
    navigate(`/studies/${data.studyId}/enter`);
    onClose();
  };

  // ✅ 경로는 가정: 수정 페이지
  const onEdit = () => {
    navigate(`/studies/${data.studyId}/edit`);
    onClose();
  };

  const onDelete = () => {
    const ok = window.confirm("정말 삭제할까요? (지금은 API 미연동이라 실제 삭제는 안돼요)");
    if (ok) {
      setMenuOpen(false);
      alert("삭제 요청(목업) 처리!");
    }
  };

  return createPortal(
    <div
      className="svmOverlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="svmWrap">
        <div className="svmHeroTitle">
          <div className="svmHeroBig"></div>
        </div>

        <div className="svmBody">
          <div className="svmCard">
            <button
              className="svmKebab"
              type="button"
              aria-label="menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              ⋮
            </button>

            <div className="svmTop">
              <div className="svmCover">
                {data.coverImage ? (
                  <img src={data.coverImage} alt="" />
                ) : (
                  <div className="svmCoverFallback">
                    <img src={FALLBACK_LOGO_SRC} alt="logo" />
                  </div>
                )}
              </div>

              <div className="svmInfo">
                <div className="svmChips">
                  <span className={`svmChip ${data.isPublic ? "on" : ""}`}>
                    {data.isPublic ? "공개" : "비공개"}
                  </span>
                  <span className="svmChip ghost">{data.categoryLabel ?? "기타"}</span>
                </div>

                <div className="svmTitle">{data.studyName}</div>
                <div className="svmDesc">{data.description ?? ""}</div>

                <div className="svmRow">
                  <span className={`svmPill ${canJoin ? "ok" : "no"}`}>
                    {canJoin ? "참여가능" : "참여불가능"}
                  </span>

                  <div className="svmCount">
                    <div className="svmCountLabel">실시간 참여수</div>
                    <div className="svmCountValue">
                      <b>{data.liveCount}</b>/<b>{data.limit}</b>
                    </div>
                  </div>
                </div>

                <div className="svmActionsRow">
                  <button className="svmEnterBtn" type="button" onClick={onEnter}>
                    입장하기
                  </button>

                  <button
                    className={`svmHeart ${isFav ? "active" : ""}`}
                    type="button"
                    onClick={onToggleFav}
                    aria-label="favorite"
                  >
                    ♡
                  </button>
                </div>
              </div>
            </div>

            <div className="svmRankBox">
              <div className="svmRankHeader">
                <div className="svmRankTab">
                  <button className="svmTabBtn" type="button">
                    일간 / 누적
                  </button>
                </div>

                <div className="svmRankTitlePill">스터디 랭킹 보드</div>
              </div>

              <table className="svmTable">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>순위</th>
                    <th>닉네임</th>
                    <th>일간 참가시간</th>
                    <th>누적 참가시간</th>
                  </tr>
                </thead>
                const rows = data?.ranking ?? [];
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.rank}>
                      <td className="svmRankNum">{r.rank}</td>
                      <td>{r.nickname}</td>
                      <td>{r.dailyMinutes == null ? "" : mmToHourMin(r.dailyMinutes)}</td>
                      <td>{mmToHourMin(r.totalMinutes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="svmMiniToggle">
                <button
                  type="button"
                  className={`svmMiniBtn ${tab === "daily" ? "active" : ""}`}
                  onClick={() => setTab("daily")}
                >
                  일간
                </button>
                <button
                  type="button"
                  className={`svmMiniBtn ${tab === "total" ? "active" : ""}`}
                  onClick={() => setTab("total")}
                >
                  누적
                </button>
              </div>
            </div>
          </div>

          <div className="svmSide">
            {menuOpen && (
              <div className="svmSideBox">
                <div className="svmSideTitle">수정/삭제</div>
                <div className="svmSideMenu">
                  <button type="button" className="svmSideBtn" onClick={onEdit}>
                    수정
                  </button>
                  <div className="svmLine" />
                  <button type="button" className="svmSideBtn danger" onClick={onDelete}>
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <button className="svmClose" type="button" onClick={onClose} aria-label="close">
          ✕
        </button>
      </div>
    </div>,
    document.body
  );
}