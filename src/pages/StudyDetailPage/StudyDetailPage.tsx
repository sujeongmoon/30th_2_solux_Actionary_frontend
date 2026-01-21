import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./StudyViewModal.css"; 

import StudyNoImg from "../../assets/study_noimg.png";
import { useAuth } from "../../context/AuthContext";
import {
  deleteStudy,
  enterPrivateStudy,
  enterPublicStudy,
  getStudyDetail,
  getStudyRankings,
  toggleStudyLike,
} from "../../api/studies";

type Props = {
  open: boolean;
  onClose: () => void;
  studyId: number;
};

export default function StudyViewModal({ open, onClose, studyId }: Props) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);

  const [rankType, setRankType] = useState<"today" | "total">("today");
  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState<string | null>(null);
  const [rankings, setRankings] = useState<any[]>([]);

  const [pwOpen, setPwOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const [actionModalMode, setActionModalMode] = useState<
    "login_enter" | "login_like" | "capacity" | null
  >(null);

  // ===== detail fetch =====
  useEffect(() => {
    if (!open || !studyId) return;

    let mounted = true;
    setDetailLoading(true);
    setDetailError(null);

    (async () => {
      try {
        const data = await getStudyDetail(studyId);
        if (!mounted) return;
        setDetail(data);
      } catch (e: any) {
        if (!mounted) return;
        setDetailError(e?.response?.data?.message ?? "스터디 정보를 불러오지 못했어요.");
      } finally {
        if (mounted) setDetailLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, studyId]);

  // ===== ranking fetch =====
useEffect(() => {
  if (!open || !studyId) return;

  let mounted = true;
  setRankLoading(true);
  setRankError(null);

  (async () => {
    try {
      const data = await getStudyRankings(studyId, rankType);

      if (!mounted) return;


      const list =
        Array.isArray(data) ? data :
        Array.isArray((data as any)?.rankings) ? (data as any).rankings :
        Array.isArray((data as any)?.data?.rankings) ? (data as any).data.rankings :
        [];

      setRankings(list);
    } catch (e: any) {
      if (!mounted) return;
      setRankError(e?.response?.data?.message ?? "랭킹을 불러오지 못했어요.");
      setRankings([]);
    } finally {
      if (mounted) setRankLoading(false);
    }
  })();

  return () => {
    mounted = false;
  };
}, [open, studyId, rankType]);
  // ESC 닫기 + body scroll lock
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const isPublic = Boolean(detail?.isPublic ?? detail?.public ?? detail?.visibility === "PUBLIC");
  const memberNow = Number(detail?.memberNow ?? 0);
  const memberLimit = Number(detail?.memberLimit ?? 0);

  const isFull = memberLimit > 0 && memberNow >= memberLimit;

  const coverSrc = detail?.coverImage ? detail.coverImage : StudyNoImg;

  const canUseMenu = useMemo(() => {
    // 서버에서 “내가 방장인지” 내려주는 필드가 다를 수 있어서
    // 일단 가능한 후보들을 체크해봄
    return Boolean(detail?.isOwner ?? detail?.owned ?? detail?.isLeader ?? false);
  }, [detail]);

  const onToggleLike = async () => {
    if (!isLoggedIn) {
      setActionModalMode("login_like");
      return;
    }
    try {
      await toggleStudyLike(studyId);
      // 좋아요 상태를 서버가 detail에 반영 안해줄 수 있으니, 필요하면 detail 다시 fetch
      // 간단히는 새로고침 or detail 재조회
      const data = await getStudyDetail(studyId);
      setDetail(data);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "즐겨찾기 처리에 실패했어요.");
    }
  };

  const onEnterClick = async () => {
    if (!isLoggedIn) {
      setActionModalMode("login_enter");
      return;
    }
    if (isFull) {
      setActionModalMode("capacity");
      return;
    }

    if (!isPublic) {
      setPwOpen(true);
      setPassword("");
      setPwError(null);
      return;
    }

    try {
      await enterPublicStudy(studyId);
      onClose();
      navigate(`/studies/${studyId}/room`);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "스터디 참가에 실패했어요.");
    }
  };

  const onSubmitPassword = async () => {
    setPwLoading(true);
    setPwError(null);
    try {
      await enterPrivateStudy(studyId, password);
      onClose();
      navigate(`/studies/${studyId}/room`);
    } catch (e: any) {
      console.log(
        "❗ 비공개 입장 실패",
        "url:", e?.config?.url,
        "status:", e?.response?.status
      );

      const status = e?.response?.status;

      if (status === 401) {
        setPwError("비밀번호가 일치하지 않습니다.");
        return;
      }
  
      setPwError(e?.response?.data?.message ?? "비밀번호 확인 실패");
    } finally {
      setPwLoading(false);
    }
  };

  /** 수정 */
  const onEdit = () => {
    if (!studyId) return;
    onClose();
    navigate(`/studies/${studyId}/edit`);
  };

  /** 삭제 (진짜 동작) */
  const onDelete = async () => {
    if (!studyId) return;

    const ok = window.confirm("정말 이 스터디를 삭제할까요? 삭제하면 복구가 어려워요.");
    if (!ok) return;

    try {
      await deleteStudy(studyId);
      alert("삭제 완료!");
      onClose();

      // 목록 화면으로 이동 (원하면 다른 경로로 바꿔)
      navigate("/studies");
      // 또는 목록 새로고침이 필요하면:
      // window.location.reload();
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "삭제에 실패했어요.");
    }
  };

  if (!open) return null;

  return createPortal(
    <>
      <div
        className="svmOverlay"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="svmWrap">
          <button className="svmClose" type="button" aria-label="close" onClick={onClose}>
            ✕
          </button>

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
                <div className="svmErrorBox">데이터가 없어요.</div>
              ) : (
                <>
                  <div className="svmTop">
                    <div className="svmCover">
                      <img src={coverSrc} alt="" />
                    </div>

                    <div className="svmInfo">
                      <div className="svmChips">
                        <span className={`svmChip ${isPublic ? "on" : ""}`}>
                          {isPublic ? "공개" : "비공개"}
                        </span>
                        <span className="svmChip ghost">{detail?.categoryLabel ?? "카테고리"}</span>
                      </div>

                      <div className="svmTitle">{detail?.studyName ?? "스터디"}</div>
                      <div className="svmDesc">{detail?.description ?? ""}</div>

                      <div className="svmRow">
                        <span className={`svmPill ${isFull ? "no" : "ok"}`}>
                          {isFull ? "정원 마감" : "참여 가능"}
                        </span>

                        <div className="svmCount">
                          <span className="svmCountLabel">현재 인원</span>
                          <span className="svmCountValue">
                            <b>{memberNow}</b> / <b>{memberLimit || "∞"}</b>
                          </span>
                        </div>
                      </div>

                      <div className="svmActionsRow">
                        <button
                          type="button"
                          className="svmEnterBtn"
                          onClick={onEnterClick}
                          disabled={detailLoading || isFull}
                        >
                          스터디 참가하기
                        </button>

                        <button
                          type="button"
                          className={`svmHeart ${detail?.liked ? "active" : ""}`}
                          onClick={onToggleLike}
                          aria-label="like"
                        >
                          ♥
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="svmRankBox">
                    <div className="svmRankHeader">
                      <div className="svmRankTitlePill">랭킹</div>

                      <div className="svmMiniToggle">
                        <button
                          type="button"
                          className={`svmMiniBtn ${rankType === "today" ? "active" : ""}`}
                          onClick={() => setRankType("today")}
                        >
                          오늘
                        </button>
                        <button
                          type="button"
                          className={`svmMiniBtn ${rankType === "total" ? "active" : ""}`}
                          onClick={() => setRankType("total")}
                        >
                          누적
                        </button>
                      </div>
                    </div>

                    {rankLoading ? (
                      <div className="svmLoading">랭킹 불러오는 중...</div>
                    ) : rankError ? (
                      <div className="svmErrorBox">{rankError}</div>
                    ) : (
                      <table className="svmTable">
                        <thead>
                          <tr>
                            <th style={{ width: 90 }}>순위</th>
                            <th>닉네임</th>
                            <th style={{ width: 140 }}>시간</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(rankings ?? []).map((r: any, idx: number) => (
                            <tr key={r?.userId ?? idx}>
                              <td className="svmRankNum">{idx + 1}</td>
                              <td>{r?.nickname ?? "-"}</td>
                              <td>{r?.time ?? r?.totalTime ?? "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 오른쪽 메뉴(수정/삭제) */}
            <aside className="svmSide">
              <div className="svmSideBox">
                {menuOpen && canUseMenu && (
                  <div className="svmSideMenu">
                    <button className="svmSideBtn" type="button" onClick={onEdit}>
                      수정
                    </button>
                    <div className="svmLine" />
                    <button className="svmSideBtn danger" type="button" onClick={onDelete}>
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* 비공개 비번 모달 */}
      {pwOpen && (
        <div
          className="svmOverlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPwOpen(false);
          }}
        >
          <div className="svmWrap" style={{ width: "min(520px, calc(100vw - 48px))" }}>
            <div className="svmCard">
              <div className="svmTitle" style={{ fontSize: 20, marginBottom: 12 }}>
                비밀번호 입력
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,.12)",
                  padding: "0 12px",
                }}
              />
              {pwError && <div style={{ marginTop: 8, color: "#ff3b5c" }}>{pwError}</div>}

              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  className="svmMiniBtn"
                  onClick={() => setPwOpen(false)}
                  disabled={pwLoading}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="svmMiniBtn active"
                  onClick={onSubmitPassword}
                  disabled={pwLoading || !password}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 로그인 필요/정원마감 안내 모달 */}
      {actionModalMode && (
        <div
          className="svmOverlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActionModalMode(null);
          }}
        >
          <div className="svmWrap" style={{ width: "min(520px, calc(100vw - 48px))" }}>
            <div className="svmCard">
              <div className="svmTitle" style={{ fontSize: 20, marginBottom: 10 }}>
                {actionModalMode === "capacity"
                  ? "참여 불가"
                  : actionModalMode === "login_like"
                  ? "즐겨찾기 불가"
                  : "스터디 참가 불가"}
              </div>
              <div className="svmDesc" style={{ marginBottom: 14 }}>
                {actionModalMode === "capacity"
                  ? "이미 정원이 찼습니다."
                  : actionModalMode === "login_like"
                  ? "로그인 후 즐겨찾기를 사용할 수 있어요."
                  : "로그인 후 스터디에 참여할 수 있어요."}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="svmMiniBtn" onClick={() => setActionModalMode(null)}>
                  닫기
                </button>
                {actionModalMode !== "capacity" && (
                  <button
                    type="button"
                    className="svmMiniBtn active"
                    onClick={() => {
                      setActionModalMode(null);
                      onClose();
                      navigate("/login");
                    }}
                  >
                    로그인 하러가기
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}