import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./StudyViewModal.css";
import ActionaryLoginModal from "./ActionaryLoginModal/ActionaryLoginModal";
import noImg from "../../assets/study_noimg.png";
import UnionIcon from "../../assets/icons/Union.svg";

import {
  getStudyDetail,
  toggleStudyLike,
  getStudyRankings,
  enterPublicStudy,
  enterPrivateStudy,
  deleteStudy,
} from "../../api/studies";

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

type Props = {
  open: boolean;
  onClose: () => void;
  studyId: number | null;
};

function toHM(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);

  if (h === 0) {
    return `${m}분`;
  }

  if (m === 0) {
    return `${h}시간`;
  }

  return `${h}시간 ${m}분`;
}




export default function StudyViewModal({ open, onClose, studyId }: Props) {
  /*const USE_MOCK = true;*/
  const navigate = useNavigate();

  /** UI 상태 */
  const [menuOpen, setMenuOpen] = useState(false);
  const [rankTab, setRankTab] = useState<"today" | "total">("today");

  /** 액셔너리 모달 (로그인 필요 / 정원초과 공통으로) */
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionModalMode, setActionModalMode] = useState<"login_enter" | "login_like" | "capacity">(
    "login_enter"
  );

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

  /** 삭제 로딩 */
  const [deleteLoading, setDeleteLoading] = useState(false);

  /** 로그인 여부: 클릭 시점마다 확인 */
  const isLoggedInNow = () => !!localStorage.getItem("accessToken");

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
    setActionModalOpen(false);
  }, [open]);

  /** 상세 불러오기 */
  useEffect(() => {
    if (!open || !studyId) return;

    let mounted = true;
    (async () => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const data = await getStudyDetail(studyId);
        const mapped: StudyDetail = {
          studyId: Number(data.studyId ?? studyId),
          studyName: String(data.studyName ?? ""),
          coverImage: (data.coverImage ?? null) as string | null,
          categoryLabel: String(data.categoryLabel ?? "기타"),
          description: String(data.description ?? ""),
          memberNow: Number(data.memberNow ?? 0),
          memberLimit: Number(data.memberLimit ?? 0),
          isPublic: !!data.isPublic,
          isStudyLike: !!data.isStudyLike,
          isStudyOwner: !!data.isStudyOwner,
        };
        if (!mounted) return;
        setDetail(mapped);
      } catch (e: any) {
        if (!mounted) return;


        const status = e?.response?.status;
        if (status === 401) {
          setActionModalMode("login_enter");
          setActionModalOpen(true);
          setDetailError("로그인이 필요해요.");
        } else {
          setDetailError(e?.response?.data?.message ?? "스터디 정보를 불러오지 못했습니다.");
        }
        setDetail(null);
      } finally {
        if (mounted) setDetailLoading(false);
      }
    })();


    return () => {
      mounted = false;
    };
  }, [open, studyId]);

  /** 랭킹 */
  useEffect(() => {
    if (!open || studyId == null) return;

    /*if (USE_MOCK) {
      setRankLoading(false);
      setRankError(null);
      setRankRows(MOCK_RANKINGS[studyId] ?? []);
      return;
    }*/

    let mounted = true;
    (async () => {
      try {
        setRankLoading(true);
        setRankError(null);

        const data: any = await getStudyRankings(studyId, rankTab);
        const list = Array.isArray(data?.rankingBoards) ? data.rankingBoards : [];
        const mapped: RankingRow[] = list.map((r: any, idx: number) => ({
          userId: Number(r.userId ?? idx + 1),
          userNickname: String(r.userNickname ?? "익명"),
          todayDurationSeconds: Number(r.todayDurationSeconds ?? 0),
          totalDurationSeconds: Number(r.totalDurationSeconds ?? 0),
        }));
        if (!mounted) return;
        setRankRows(mapped);
      } catch (e: any) {
        if (!mounted) return;

        const status = e?.response?.status;
        if (status === 401) {
          setRankError("로그인이 필요해요.");
        } else {
          setRankError(e?.response?.data?.message ?? "랭킹 데이터를 불러오지 못했습니다.");
        }
        setRankRows([]);
      } finally {
        if (mounted) setRankLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open, studyId, rankTab]);



  const isOwner = detail?.isStudyOwner ?? false;
  const isLiked = detail?.isStudyLike ?? false;

  const canJoin = useMemo(() => {
    if (!detail) return false;
    if (detail.memberLimit <= 0) return true;
    return detail.memberNow < detail.memberLimit;
  }, [detail]);

  if (!open) return null;

  /**액셔너리 모달 열기 */
  const openActionModal = (mode: "login_enter" | "login_like" | "capacity") => {
    setActionModalMode(mode);
    setActionModalOpen(true);
  };

  /** 좋아요 토글 */
  const onToggleLike = async () => {
    if (!studyId || likeLoading) return;

    if (!isLoggedInNow()) {
      openActionModal("login_like");
      return;
    }

    setLikeLoading(true);
    try {
      await toggleStudyLike(studyId);
      setDetail((prev) => (prev ? { ...prev, isStudyLike: !prev.isStudyLike } : prev));
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        openActionModal("login_like");
        return;
      }
      alert(e?.response?.data?.message ?? "즐겨찾기 변경 실패");
    } finally {
      setLikeLoading(false);
    }
  };


  /** 입장하기 */
  const onEnterClick = async () => {
    if (!detail || enterLoading) return;

    if (!isLoggedInNow()) {
      openActionModal("login_enter");
      return;
    }


    if (!canJoin) {
      openActionModal("capacity");
      return;
    }


    if (detail.isPublic) {
      try {
        setEnterLoading(true);
        await enterPublicStudy(detail.studyId);
        onClose();
        navigate(`/study-room/${detail.studyId}`);
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 401) {
          openActionModal("login_enter");
          return;
        }
        alert(e?.response?.data?.message ?? "스터디 입장 실패");
      } finally {
        setEnterLoading(false);
      }
      return;
    }

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


    try {
      setPwLoading(true);
      setPwError(null);
      await enterPrivateStudy(studyId, password);
      setPwModalOpen(false);
      onClose();
      navigate(`/study-room/${studyId}`);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        openActionModal("login_enter");
        return;
      }
      setPwError(e?.response?.data?.message ?? "비밀번호 확인 실패");
    } finally {
      setPwLoading(false);
    }
  };

  /** 수정/삭제 */
  const onEdit = () => {
    if (!studyId) return;
    onClose();
    navigate(`/studies/${studyId}/edit`);
  };

  const onDelete = async () => {
    if (!studyId || deleteLoading) return;
  
    const ok = window.confirm("정말 삭제할까요?");
    if (!ok) return;
  
    try {
      setDeleteLoading(true);
  
      await deleteStudy(studyId);
  
      alert("스터디가 삭제되었습니다.");
  
      // 모달/메뉴 정리
      setMenuOpen(false);
      onClose();
  
      // (선택) 목록에게 갱신 신호 (목록이 이 이벤트 듣고 있으면 사용)
      window.dispatchEvent(new CustomEvent("study:deleted", { detail: { studyId } }));

      // 목록으로 이동 (가장 일반적)
      navigate("/studies");
    } catch (e: any) {
      const status = e?.response?.status;
  
      if (status === 401) {
        openActionModal("login_enter");
        return;
      }
      if (status === 403) {
        alert("삭제 권한이 없어요. (방장만 삭제 가능)");
        return;
      }
      if (status === 409) {
        alert("참여 중인 유저가 있어 삭제할 수 없어요.");
        return;
      }
      if (status === 404) {
        alert("이미 삭제되었거나 존재하지 않는 스터디예요.");
        return;
      }
  
      alert(e?.response?.data?.message ?? "스터디 삭제 실패");
    } finally {
      setDeleteLoading(false);
      setMenuOpen(false);
    }
  };


  /** 액셔너리 모달 문구 */
  const modalTitle =
    actionModalMode === "capacity"
      ? "참여 불가"
      : actionModalMode === "login_like"
      ? "즐겨찾기 불가"
      : "스터디 참가 불가";

  const modalSub =
    actionModalMode === "capacity"
      ? "이미 정원이 찼습니다."
      : actionModalMode === "login_like"
      ? "로그인 후 즐겨찾기를 사용할 수 있어요."
      : "로그인 후 스터디에 참여할 수 있어요.";

  const showGoLogin = actionModalMode !== "capacity";

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

              {detailLoading ? (
                <div className="svmLoading">불러오는 중...</div>
              ) : detailError ? (
                <div className="svmErrorBox">{detailError}</div>
              ) : !detail ? (
                <div className="svmErrorBox">데이터가 없습니다.</div>
              ) : (
                <>
                  <div className="svmTop">
                    <div className="svmCover">
                    <img src={detail.coverImage || noImg} alt="" />
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

      {/*로그인/정원초과 공통 모달 */}
      <ActionaryLoginModal
        open={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onGoLogin={() => {
          setActionModalOpen(false);
          onClose();
          navigate("/login");
        }}
        title={modalTitle}
        subtitle={modalSub}
        showGoLogin={showGoLogin}
      />
    </>,
    document.body
  );
}

/* ===== 기존 비번 모달 유지 ===== */
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
          <img className="pwIcon" src={UnionIcon} alt="" />
          <div className="pwTitle">비공개 스터디 참여</div>
        </div>

        <div className="pwSub">비밀번호를 입력해주세요.</div>

        <input
          className="pwInput"
          value={password}
          onChange={(e) => setPassword(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
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