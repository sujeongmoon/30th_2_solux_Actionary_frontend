import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./StudyViewModal.css";
import {
  getStudyDetail,
  toggleStudyLike,
  getStudyRankings,
  enterPublicStudy,
  enterPrivateStudy,
} from "../../api/studies";

/** ====== 타입: API 응답 기반(필요 최소) ====== */
type StudyDetail = {
  studyId: number;
  studyName: string;
  coverImage: string;
  categoryLabel: string;
  description: string;
  memberNow: number;
  memberLimit: number;
  isPublic: boolean;
  isStudyLike: boolean;
  isStudyOwner: boolean;
};

type RankingRow = {
  userId: number;
  userNickname: string;
  todayDurationSeconds: number;
  totalDurationSeconds: number;
};

type RankingsResponse = {
  studyId: number;
  isToday: boolean;
  rankingBoards: RankingRow[];
};

/** ====== Props ====== */
type Props = {
  open: boolean;
  onClose: () => void;

  /** StudyPage에서 카드 클릭 시 넘겨줄 id */
  studyId: number | null;
};


/** ====== 유틸 ====== */
function toHM(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}시간_${m}분`;
}

// 목업 상세 데이터 (studyId별)
const MOCK_DETAIL: Record<number, StudyDetail> = {
  1: {
    studyId: 1,
    studyName: "같이 공부해요",
    coverImage: "https://picsum.photos/seed/study1/600/600",
    categoryLabel: "기타",
    description: "설명설명설명설명설명설명설명",
    memberNow: 5,
    memberLimit: 15,
    isPublic: true,
    isStudyLike: false,
    isStudyOwner: true,
  },
  2: {
    studyId: 2,
    studyName: "공무원 한국사",
    coverImage: "https://picsum.photos/seed/study2/600/600",
    categoryLabel: "공무원",
    description: "공무원 한국사 같이 달려요",
    memberNow: 3,
    memberLimit: 10,
    isPublic: true, 
    isStudyLike: true,
    isStudyOwner: false,
  },
  3: {
    studyId: 3,
    studyName: "토익 900+",
    coverImage: "https://picsum.photos/seed/study3/600/600",
    categoryLabel: "어학",
    description: "토익 점수 올리기",
    memberNow: 8,
    memberLimit: 20,
    isPublic: true,
    isStudyLike: true,
    isStudyOwner: false,
  },
  6: {
    studyId: 6,
    studyName: "비공개 스터디입니다",
    coverImage: "https://picsum.photos/seed/private/600/600",
    categoryLabel: "임용",
    description: "이 스터디는 비공개입니다. 비밀번호가 필요합니다.",
    memberNow: 3,
    memberLimit: 10,
    isPublic: false,        // 🔴 핵심
    isStudyLike: false,
    isStudyOwner: false,
  },
};

const MOCK_PRIVATE_PASSWORD: Record<number, string> = {
  6: "000000",
};


export default function StudyViewModal({ open, onClose, studyId }: Props) {
  const USE_MOCK = true;
  const navigate = useNavigate();

  /** UI 상태 */
  const [menuOpen, setMenuOpen] = useState(false);
  const [rankTab, setRankTab] = useState<"today" | "total">("today");

  /** 상세 데이터 */
  const [detail, setDetail] = useState<StudyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  /** 랭킹 */
  const [rankRows, setRankRows] = useState<RankingRow[]>([]);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState<string | null>(null);

  /** 좋아요 토글 로딩 */
  const [likeLoading, setLikeLoading] = useState(false);

  /** 비공개 비번 모달 */
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  /** 입장 로딩 */
  const [enterLoading, setEnterLoading] = useState(false);

  /** ESC 닫기 */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  /** 모달 열릴 때 상태 초기화 */
  useEffect(() => {
    if (!open) return;
    setMenuOpen(false);
    setRankTab("today");
    setPwModalOpen(false);
    setPwError(null);
  }, [open]);

useEffect(() => {
  if (!open || !studyId) return;

  // 목업 모드: studyId별로 detail 주입
  if (USE_MOCK) {
    setDetailLoading(false);
    setDetailError(null);

    const picked = MOCK_DETAIL[studyId];
    setDetail(
      picked ?? {
        studyId,
        studyName: `스터디 #${studyId}`,
        coverImage: "https://picsum.photos/seed/fallback/600/600",
        categoryLabel: "기타",
        description: "목업 상세 데이터가 없습니다.",
        memberNow: 0,
        memberLimit: 10,
        isPublic: true,
        isStudyLike: false,
        isStudyOwner: false,
      }
    );
    return;
  }

  let mounted = true;

  (async () => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const data = await getStudyDetail(studyId);
      if (mounted) setDetail(data);
    } catch (e: any) {
      if (mounted) {
        setDetailError(e?.response?.data?.message ?? "스터디 정보를 불러오지 못했습니다.");
        setDetail(null);
      }
    } finally {
      if (mounted) setDetailLoading(false);
    }
  })();

  return () => {
    mounted = false;
  };
}, [open, studyId]);

  const isOwner = detail?.isStudyOwner ?? false;
  const isLiked = detail?.isStudyLike ?? false;
  const canJoin = useMemo(() => {
    if (!detail) return false;
    return detail.memberNow < detail.memberLimit;
  }, [detail]);

  if (!open) return null;

  /**좋아요 토글 */
  const onToggleLike = async () => {
    if (!studyId || likeLoading) return;
    setLikeLoading(true);
    try {
      await toggleStudyLike(studyId);
      // 토글 반영(프론트 낙관 업데이트)
      setDetail((prev) => (prev ? { ...prev, isStudyLike: !prev.isStudyLike } : prev));
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "즐겨찾기 변경 실패");
    } finally {
      setLikeLoading(false);
    }
  };

  /** 입장하기 */
  const goStudyRoom = (id: number) => {
    navigate(`/study-room/${id}`);
  };

  const onEnterClick = async () => {
    if (!detail || enterLoading) return;
  
    // 인원 초과면 막기
    if (detail.memberNow >= detail.memberLimit) return;
  
    if (detail.isPublic) {
      // 공개: 바로 이동 (나중에 enterPublicStudy 붙일 자리)
      onClose();
      navigate(`/study-room/${detail.studyId}`);
      return;
    }
  
    // 비공개: 비번 모달
    setPwError(null);
    setPassword("");
    setPwModalOpen(true);
  };
    /** 비공개 비번 확인 */
const onConfirmPassword = async () => {
  if (!detail || !studyId) return;

  if (password.length < 6) {
    setPwError("6자리 비밀번호를 입력해주세요.");
    return;
  }

  // 목업 검증
  if (USE_MOCK) {
    const correct = MOCK_PRIVATE_PASSWORD[studyId] ?? "001122";

    if (password !== correct) {
      setPwError("비밀번호가 틀렸습니다.");
      return;
    }

    // 비밀번호 맞으면 이동
    setPwModalOpen(false);
    onClose();
    navigate(`/study-room/${studyId}`);
    return;
  }

  // 나중에 실제 API 붙일 자리
  try {
    setPwLoading(true);
    setPwError(null);

    await enterPrivateStudy(studyId, password);

    setPwModalOpen(false);
    onClose();
    navigate(`/study-room/${studyId}`);
  } catch (e: any) {
    setPwError(e?.response?.data?.message ?? "비밀번호 확인 실패");
  } finally {
    setPwLoading(false);
  }
};

  /** 수정/삭제: 일단 UI만 (API는 마지막에 붙이자) */
  const onEdit = () => {
    if (!studyId) return;
    onClose();
    navigate(`/studies/${studyId}/edit`);
  };

  const onDelete = async () => {
    alert("삭제 API 아직입니다..");
  };

  /** ====== 렌더 ====== */
  return createPortal(
    <>
      <div
        className="svmOverlay"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="svmWrap">
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

              {/* ===== 상세 로딩/에러 ===== */}
              {detailLoading ? (
                <div className="svmLoading">불러오는 중...</div>
              ) : detailError ? (
                <div className="svmErrorBox">{detailError}</div>
              ) : !detail ? (
                <div className="svmErrorBox">데이터가 없습니다.</div>
              ) : (
                <>
                  {/* ===== 상단 카드 ===== */}
                  <div className="svmTop">
                    <div className="svmCover">
                      <img src={detail.coverImage} alt="" />
                    </div>

                    <div className="svmInfo">
                      <div className="svmChips">
                        <span className={`svmChip ${detail.isPublic ? "on" : ""}`}>
                          {detail.isPublic ? "공개" : "비공개"}
                        </span>
                        <span className="svmChip ghost">{detail.categoryLabel ?? "기타"}</span>
                      </div>

                      <div className="svmTitle">{detail.studyName}</div>
                      <div className="svmDesc">{detail.description}</div>

                      <div className="svmRow">
                        <span className={`svmPill ${canJoin ? "ok" : "no"}`}>
                          {canJoin ? "참여가능" : "참여불가능"}
                        </span>

                        <div className="svmCount">
                          <div className="svmCountLabel">실시간 참여수</div>
                          <div className="svmCountValue">
                            <b>{detail.memberNow}</b>/<b>{detail.memberLimit}</b>
                          </div>
                        </div>
                      </div>

                      <div className="svmActionsRow">
                        <button
                          className="svmEnterBtn"
                          type="button"
                          onClick={onEnterClick}
                          disabled={enterLoading}
                        >
                          {enterLoading ? "입장 중..." : "입장하기"}
                        </button>

                        <button
                          className={`svmHeart ${isLiked ? "active" : ""}`}
                          type="button"
                          onClick={onToggleLike}
                          disabled={likeLoading}
                          aria-label="favorite"
                        >
                          ♡
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ===== 랭킹 ===== */}
                  <div className="svmRankBox">
                    <div className="svmRankHeader">
                      <div className="svmMiniToggle">
                        <button
                          type="button"
                          className={`svmMiniBtn ${rankTab === "today" ? "active" : ""}`}
                          onClick={() => setRankTab("today")}
                        >
                          일간
                        </button>
                        <button
                          type="button"
                          className={`svmMiniBtn ${rankTab === "total" ? "active" : ""}`}
                          onClick={() => setRankTab("total")}
                        >
                          누적
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

                      <tbody>
                        {rankLoading ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: "center", padding: "16px 0" }}>
                              불러오는 중...
                            </td>
                          </tr>
                        ) : rankError ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: "center", padding: "16px 0" }}>
                              {rankError}
                            </td>
                          </tr>
                        ) : rankRows.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: "center", padding: "16px 0" }}>
                              랭킹 데이터가 없습니다.
                            </td>
                          </tr>
                        ) : (
                          rankRows.map((r, idx) => (
                            <tr key={r.userId}>
                              <td className="svmRankNum">{idx + 1}</td>
                              <td>{r.userNickname}</td>
                              <td>{toHM(r.todayDurationSeconds)}</td>
                              <td>{toHM(r.totalDurationSeconds)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* ===== 오른쪽 수정/삭제 박스: 방장일 때만 ===== */}
            <div className="svmSide">
              {menuOpen && isOwner && (
                <div className="svmSideBox">
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
      </div>

      {/* 비공개 비밀번호 입력 모달 */}
      <PrivatePasswordModal
        open={pwModalOpen}
        password={password}
        setPassword={setPassword}
        onClose={() => setPwModalOpen(false)}
        onConfirm={onConfirmPassword}
        error={pwError}
      />
    </>,
    document.body
  );
}

function PrivatePasswordModal({
  open,
  password,
  setPassword,
  onClose,
  onConfirm,
  error,
}: {
  open: boolean;
  password: string;
  setPassword: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  error?: string | null;
}) {
  if (!open) return null;


  
  return createPortal(
    <div
      className="pwOverlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="pwModal">
        <div className="pwHeader">
          <span className="pwDot" />
          <div className="pwTitle">비공개 스터디 참여</div>
        </div>

        <div className="pwSub">비밀번호를 입력해주세요.</div>

        <input
          className="pwInput"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6자리 비밀번호를 입력하세요."
          inputMode="numeric"
          maxLength={6}
        />

        {error ? <div className="pwError">{error}</div> : null}

        <div className="pwBtns">
          <button className="pwCancel" onClick={onClose}>
            취소
          </button>
          <button className="pwOk" onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

