import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./StudyDetailPage.css";
import noImg from "../../assets/study_noimg.png";
import ActionaryLoginModal from "./ActionaryLoginModal/ActionaryLoginModal";
import {
  getStudyDetail,
  toggleStudyLike,
  enterPublicStudy,
  enterPrivateStudy,
  getStudyRankings,
} from "../../api/studies";

type DetailView = {
  studyId: number;
  studyName: string;
  coverImage?: string | null;
  categoryLabel?: string;
  isPublic: boolean;
  description?: string;
  guide?: string;
  memberLimit?: number;
  memberCount?: number;
  liked?: boolean;
};

type RankingItem = {
  rank: number;
  nickname: string;
  daily?: string | null;
  total?: string | null;
};

export default function StudyDetailPage() {
  const navigate = useNavigate();
  const { studyId } = useParams();

  const id = Number(studyId);
  const isValidId = Number.isFinite(id) && id > 0;

  // ===== detail =====
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<DetailView | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ===== login modal =====
  const [loginOpen, setLoginOpen] = useState(false);

  // ===== rankings preview =====
  const [rankTab, setRankTab] = useState<"today" | "total">("today");
  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState<string | null>(null);
  const [rankings, setRankings] = useState<RankingItem[]>([]);

  const needPassword = useMemo(() => detail && !detail.isPublic, [detail]);

  // ===== 1) 상세 조회 =====
  useEffect(() => {
    if (!isValidId) return;

    let mounted = true;

    (async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const data: any = await getStudyDetail(id);

        if (!mounted) return;

        setDetail({
          studyId: data.studyId ?? id,
          studyName: data.studyName ?? "",
          coverImage: data.coverImage ?? null,
          categoryLabel: data.categoryLabel ?? "기타",
          isPublic: !!data.isPublic,
          description: data.description ?? "",
          guide: data.guide ?? "",
          memberLimit: data.memberLimit,
          memberCount: data.memberCount,
          liked: data.liked,
        });
      } catch (e: any) {
        if (!mounted) return;

        const status = e?.response?.status;
        if (status === 401) {
          setLoginOpen(true);
          setErrorMsg("로그인이 필요해요.");
        } else {
          setErrorMsg(e?.response?.data?.message ?? "스터디 정보를 불러오지 못했어요.");
        }
        setDetail(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, isValidId]);

  // ===== 2) 랭킹 미리보기 조회 (today/total 탭) =====
  useEffect(() => {
    if (!isValidId) return;

    let mounted = true;

    (async () => {
      setRankLoading(true);
      setRankError(null);

      try {
        const data: any = await getStudyRankings(id, rankTab);

        if (!mounted) return;
        const rawList =
          data?.rankings ??
          data?.items ??
          data?.content ??
          data?.data ??
          [];

        const mapped: RankingItem[] = (rawList ?? []).map((r: any, idx: number) => ({
          rank: r.rank ?? idx + 1,
          nickname: r.nickname ?? r.name ?? "익명",
          daily: r.daily ?? r.today ?? null,
          total: r.total ?? null,
        }));

        setRankings(mapped);
      } catch (e: any) {
        if (!mounted) return;

        const status = e?.response?.status;
        if (status === 401) {
          setLoginOpen(true);
          setRankError("로그인이 필요해요.");
        } else {
          setRankError(e?.response?.data?.message ?? "랭킹을 불러오지 못했어요.");
        }
        setRankings([]);
      } finally {
        if (mounted) setRankLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, isValidId, rankTab]);

  // ===== actions =====
  const onToggleLike = async () => {
    if (!detail) return;

    try {
      await toggleStudyLike(detail.studyId);
      setDetail((prev) => (prev ? { ...prev, liked: !prev.liked } : prev));
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        setLoginOpen(true);
        return;
      }
      alert(e?.response?.data?.message ?? "즐겨찾기 처리 실패");
    }
  };

  const onEnter = async () => {
    if (!detail) return;

    try {
      if (detail.isPublic) {
        await enterPublicStudy(detail.studyId);
        navigate(`/study-room/${detail.studyId}`);
        return;
      }

      const pw = window.prompt("비공개 스터디 비밀번호(6자리)를 입력하세요");
      if (!pw) return;

      await enterPrivateStudy(detail.studyId, pw);
      navigate(`/study-room/${detail.studyId}`);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        setLoginOpen(true);
        return;
      }
      alert(e?.response?.data?.message ?? "스터디 입장 실패");
    }
  };

  const top5 = useMemo(() => rankings.slice(0, 5), [rankings]);

  return (
    <div className="studyDetailPage">
      {/* 상단 헤더 */}
      <header className="detailTop">
        <button className="backBtn" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>스터디 상세</h1>
        <div />
      </header>

      {!isValidId && <div className="state error">잘못된 스터디 ID예요.</div>}

      {isValidId && loading && (
        <>
          {/* 스켈레톤 */}
          <section className="card headerCard">
            <div className="cover skeleton" />
            <div className="headerInfo">
              <div className="chipRow">
                <span className="chip skeletonChip" />
                <span className="chip skeletonChip" />
              </div>
              <h2 className="skeletonLine" />
              <p className="skeletonLine short" />
              <button className="primaryBtn" disabled>
                입장하기
              </button>
            </div>
          </section>
        </>
      )}

      {isValidId && !loading && errorMsg && <div className="state error">{errorMsg}</div>}

      {isValidId && !loading && !errorMsg && detail && (
        <>
          {/* 상단 카드 */}
          <section className="card headerCard">
            <div
              className="cover"
              style={{
                backgroundImage: `url(${detail.coverImage ?? noImg})`,
              }}
            />
            <div className="headerInfo">
              <div className="chipRow">
                <span className="chip">{detail.isPublic ? "공개" : "비공개"}</span>
                <span className="chip">{detail.categoryLabel ?? "기타"}</span>
              </div>

              <h2>{detail.studyName}</h2>

              <p className="subText">{detail.description || "설명이 없습니다."}</p>

              <button className="primaryBtn" onClick={onEnter}>
                입장하기
              </button>
            </div>
          </section>

          {/* 요약 */}
          <section className="card summary">
            <div className="summaryItem">
              <span>인원</span>
              <div>
                {typeof detail.memberCount === "number" && typeof detail.memberLimit === "number"
                  ? `${detail.memberCount}/${detail.memberLimit}`
                  : detail.memberLimit
                  ? `최대 ${detail.memberLimit}명`
                  : "-"}
              </div>
            </div>
            <div className="summaryItem">
              <span>공개</span>
              <div>{detail.isPublic ? "공개" : "비공개"}</div>
            </div>
            <div className="summaryItem">
              <span>랭킹</span>
              <div>{rankTab === "today" ? "오늘" : "전체"}</div>
            </div>
          </section>

          {/* 랭킹 미리보기 */}
          <section className="card">
            <div className="rankHeaderRow">
              <h3 style={{ margin: 0 }}>랭킹 미리보기</h3>

              <div className="rankTabs">
                <button
                  type="button"
                  className={`rankTab ${rankTab === "today" ? "on" : ""}`}
                  onClick={() => setRankTab("today")}
                >
                  오늘
                </button>
                <button
                  type="button"
                  className={`rankTab ${rankTab === "total" ? "on" : ""}`}
                  onClick={() => setRankTab("total")}
                >
                  전체
                </button>
              </div>
            </div>

            {rankLoading && <div className="state">랭킹 불러오는 중…</div>}
            {!rankLoading && rankError && <div className="state error">{rankError}</div>}

            {!rankLoading && !rankError && top5.length === 0 && (
              <div className="state empty">아직 랭킹 데이터가 없어요.</div>
            )}

            {!rankLoading && !rankError && top5.length > 0 && (
              <div className="rankList">
                {top5.map((r) => (
                  <div key={`${rankTab}-${r.rank}-${r.nickname}`} className="rankRow">
                    <div className="rankLeft">
                      <span className="rankNo">{r.rank}</span>
                      <span className="rankName">{r.nickname}</span>
                    </div>

                    <div className="rankRight">
                      {rankTab === "today" ? (r.daily ?? "-") : (r.total ?? "-")}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="rankMoreBtn"
                  onClick={() => navigate(`/study-room/${detail.studyId}`)}
                >
                  스터디룸에서 전체 랭킹 보기 →
                </button>
              </div>
            )}
          </section>

          {/* 소개 */}
          <section className="card">
            <h3>소개</h3>
            <div className="textBlock">{detail.description || "설명이 없습니다."}</div>
          </section>

          {/* 규칙 */}
          <section className="card">
            <h3>안내 / 규칙</h3>
            <div className="textBlock">{detail.guide || "안내가 없습니다."}</div>
          </section>

          {/* 하단 버튼 */}
          <div className="actions">
            <button className="ghostBtn" onClick={onToggleLike}>
              {detail.liked ? "즐겨찾기 해제" : "즐겨찾기"}
            </button>
            <button className="primaryBtn" onClick={onEnter}>
              {needPassword ? "비밀번호 입력 후 참여" : "참여하기"}
            </button>
          </div>
        </>
      )}

      {/* 로그인 모달 */}
      <ActionaryLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onGoLogin={() => navigate("/login")}
        title="로그인 필요"
        subtitle="로그인이 필요한 서비스입니다."
        showGoLogin
      />
    </div>
  );
}