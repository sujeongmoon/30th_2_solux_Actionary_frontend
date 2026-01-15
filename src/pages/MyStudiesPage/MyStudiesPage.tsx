import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./MyStudiesPage.css";
import StudyViewModal, { type StudyViewData } from "../StudyDetailPage/StudyViewModal";
import { getMyStudies } from "../../api/studies";

type MyScope = "ALL" | "OWNER" | "PARTICIPATING" | "FAVORITE"; // 전체 / 개설 / 참여 / 즐겨찾기
type VisibilityFilter = "ALL" | "PUBLIC" | "PRIVATE";

type StudyCard = {
  studyId: number;
  studyName: string;
  coverImage?: string | null;
  categoryLabel?: string;
  isPublic?: boolean;
  isFavorite?: boolean;
  isOwner?: boolean;
  isParticipating?: boolean;
};

const PAGE_SIZE = 8;

// 화면 scope -> API scope 매핑
const toApiScope = (s: MyScope) => {
  if (s === "OWNER") return "OWNED";
  if (s === "PARTICIPATING") return "JOINED";
  if (s === "FAVORITE") return "LIKED";
  return "ALL";
};

// 공통 
const mapToStudyCard = (s: any, apiScope: string): StudyCard => ({
  studyId: s.studyId,
  studyName: s.studyName,
  coverImage: s.coverImage ?? null,
  categoryLabel: s.categoryLabel ?? "기타",
  isPublic: s.isPublic,
  isOwner: apiScope === "OWNED",
  isParticipating: apiScope === "JOINED",
  isFavorite: apiScope === "LIKED",
});

export default function MyStudiesPage() {
  const navigate = useNavigate();

  // 상단(나만의 스터디) 필터: 전체/개설/참여/즐겨찾기
  const [scope, setScope] = useState<MyScope>("ALL");

  // 아래(전체 카드) 공개/비공개 탭
  const [visibility, setVisibility] = useState<VisibilityFilter>("ALL");

  // 캐러셀 인덱스
  const [carouselIndex, setCarouselIndex] = useState(0);

  // 그리드 페이지네이션 (UI는 1부터)
  const [page, setPage] = useState(1);

  // ====== "전체 데이터" ======
  const [allMyStudies, setAllMyStudies] = useState<StudyCard[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [carouselError, setCarouselError] = useState<string | null>(null);

  // ====== 그리드 전용: "현재 페이지 데이터" ======
  const [items, setItems] = useState<StudyCard[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 모달 선택 상태
  const [selected, setSelected] = useState<StudyViewData | null>(null);

  useEffect(() => {
    let mounted = true;
    const apiScope = toApiScope(scope);

    (async () => {
      setCarouselLoading(true);
      setCarouselError(null);

      try {
        const first = await getMyStudies({ scope: apiScope as any, page: 1, size: 50 });

        if (!mounted) return;

        const totalPages = first.totalPages ?? 1;
        const collected: any[] = [...(first.content ?? [])];

        // 여러 페이지면 추가 요청
        if (totalPages > 1) {
          const cap = Math.min(totalPages, 20);

          for (let p = 2; p <= cap; p++) {
            const next = await getMyStudies({ scope: apiScope as any, page: p, size: 50 });
            if (!mounted) return;
            collected.push(...(next.content ?? []));
          }
        }

        const mapped = collected.map((s) => mapToStudyCard(s, apiScope));
        setAllMyStudies(mapped);
        setCarouselIndex(0);
      } catch (e: any) {
        if (!mounted) return;
        setAllMyStudies([]);
        setCarouselError(e?.response?.data?.message ?? "나만의 스터디 불러오기 실패");
      } finally {
        if (mounted) setCarouselLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [scope]);

  // ===== 2) 그리드용=====
  useEffect(() => {
    let mounted = true;
    const apiScope = toApiScope(scope);

    (async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const data = await getMyStudies({
          scope: apiScope as any,
          page,
          size: PAGE_SIZE,
        });

        if (!mounted) return;

        const mapped: StudyCard[] = (data.content ?? []).map((s: any) => mapToStudyCard(s, apiScope));

        setItems(mapped);
        setTotalCount(data.totalElements ?? mapped.length);
        setServerTotalPages(data.totalPages ?? 1);
      } catch (e: any) {
        if (!mounted) return;
        setItems([]);
        setTotalCount(0);
        setServerTotalPages(1);
        setErrorMsg(e?.response?.data?.message ?? "나만의 스터디 조회 실패");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [scope, page]);

  const carouselPageSize = 3;

  const myList = useMemo(() => allMyStudies, [allMyStudies]);

  const carouselMaxIndex = Math.max(0, Math.ceil(myList.length / carouselPageSize) - 1);

  const carouselSlice = useMemo(() => {
    const safeIndex = Math.min(carouselIndex, carouselMaxIndex);
    const start = safeIndex * carouselPageSize;
    return myList.slice(start, start + carouselPageSize);
  }, [myList, carouselIndex, carouselMaxIndex]);

  // ===== 아래 그리드=====
  const gridList = useMemo(() => {
    let result = [...items];
    if (visibility === "PUBLIC") result = result.filter((s) => s.isPublic);
    if (visibility === "PRIVATE") result = result.filter((s) => !s.isPublic);
    return result;
  }, [items, visibility]);

  const totalPages = serverTotalPages;

  // 필터 바뀌면 page 리셋
  const onChangeVisibility = (v: VisibilityFilter) => {
    setVisibility(v);
    setPage(1);
  };

  const onChangeScope = (s: MyScope) => {
    setScope(s);
    setPage(1);
    setCarouselIndex(0);
  };

  // 카드 클릭: 모달 열기 (최소 데이터만 전달)
  const openModal = (e: MouseEvent<HTMLElement>, s: StudyCard) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected({
      studyId: s.studyId,
      studyName: s.studyName,
      ranking: [],
    });
  };

  return (
    <div className="myWrap">
      {/* ===== 상단: 나만의 스터디 영역 ===== */}
      <section className="myHero">
        <div className="myHeroTop">
          <div className="myHeroTitle">나만의 스터디</div>

          <div className="myHeroFilters">
            <button className={`check ${scope === "ALL" ? "on" : ""}`} onClick={() => onChangeScope("ALL")} type="button">
              전체
            </button>
            <button className={`check ${scope === "OWNER" ? "on" : ""}`} onClick={() => onChangeScope("OWNER")} type="button">
              개설한 스터디
            </button>
            <button
              className={`check ${scope === "PARTICIPATING" ? "on" : ""}`}
              onClick={() => onChangeScope("PARTICIPATING")}
              type="button"
            >
              참여한 스터디
            </button>
            <button className={`check ${scope === "FAVORITE" ? "on" : ""}`} onClick={() => onChangeScope("FAVORITE")} type="button">
              즐겨찾기
            </button>
          </div>
        </div>

        {/* 캐러셀 전용 로딩/에러 */}
        {carouselLoading && <div className="loadingLine">불러오는 중...</div>}
        {carouselError && <div className="errorLine">{carouselError}</div>}

        <div className="carousel">
          <button
            type="button"
            className="arrow left"
            onClick={() => setCarouselIndex((i) => Math.max(0, i - 1))}
            disabled={carouselIndex <= 0}
            aria-label="prev"
          >
            ‹
          </button>

          <div className="carouselTrack">
            {carouselSlice.length === 0 ? (
              <div
                className="myStudyEmptyCta"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/studies/new")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate("/studies/new");
                }}
              >
                <button className="myStudyEmptyPlus" type="button" aria-label="스터디 만들기">
                  +
                </button>
                <div className="myStudyEmptyText">
                  <span className="myStudyEmptyIcon">🏃🏻‍♀️</span>
                  <span>지금 로그인하고, 나만의 스터디를 만들어보세요 !</span>
                </div>
              </div>
            ) : (
              <div className="carouselRow">
                {carouselSlice.map((s) => (
                  <article key={s.studyId} className="miniCard" role="button" tabIndex={0} onClick={(e) => openModal(e, s)}>
                    <div className="miniThumb">{s.coverImage ? <img src={s.coverImage} alt="" /> : <div className="miniFallback" />}</div>
                    <div className="miniLabel">{s.studyName}</div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="arrow right"
            onClick={() => setCarouselIndex((i) => Math.min(carouselMaxIndex, i + 1))}
            disabled={carouselIndex >= carouselMaxIndex}
            aria-label="next"
          >
            ›
          </button>
        </div>
      </section>

      {/* ===== 아래: 그리드 ===== */}
      <section className="myGridArea">
        <div className="gridTop">
          <div className="visTabs">
            <button type="button" className={`visTab ${visibility === "PUBLIC" ? "on" : ""}`} onClick={() => onChangeVisibility("PUBLIC")}>
              공개
            </button>
            <span className="visBar">|</span>
            <button type="button" className={`visTab ${visibility === "PRIVATE" ? "on" : ""}`} onClick={() => onChangeVisibility("PRIVATE")}>
              비공개
            </button>
          </div>

          <div className="gridMeta">
            <div className="totalText">총 {totalCount}개 스터디</div>
            <div className="catLine">
              <span className="catOn">전체</span>
              <span>· 수능</span>
              <span>· 공무원</span>
              <span>· 임용</span>
              <span>· 자격증</span>
              <span>· 어학</span>
              <span>· 취업</span>
              <span>· 기타</span>
            </div>
          </div>
        </div>

        {/* 그리드 로딩/에러 */}
        {loading && <div className="loadingLine">불러오는 중...</div>}
        {errorMsg && <div className="errorLine">{errorMsg}</div>}

        <div className="cardGrid">
          {gridList.map((s) => (
            <article key={s.studyId} className="gridCard" role="button" tabIndex={0} onClick={(e) => openModal(e, s)}>
              <div className="gridThumb">{s.coverImage ? <img src={s.coverImage} alt="" /> : <div className="gridFallback" />}</div>
              <div className="gridTitlePill">{s.studyName}</div>
            </article>
          ))}
        </div>

        <div className="pagerRow">
          <button className="pgBtn" type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            ‹
          </button>

          <div className="pgNums">
            {Array.from({ length: totalPages }).slice(0, 5).map((_, idx) => {
              const p = idx + 1;
              return (
                <button key={p} className={`pgNum ${p === page ? "on" : ""}`} type="button" onClick={() => setPage(p)}>
                  {p}
                </button>
              );
            })}
          </div>

          <button className="pgBtn" type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            ›
          </button>
        </div>
      </section>

      <StudyViewModal
        open={!!selected}
        data={
          selected ?? {
            studyId: 0,
            studyName: "",
            ranking: [],
          }
        }
        onClose={() => setSelected(null)}
        enterPath={`/study-room/${selected?.studyId ?? 0}`}
        onEdit={(id) => {
          navigate(`/studies/${id}/edit`);
        }}
        onDelete={(id) => {
          const ok = window.confirm(`스터디(${id})를 삭제할까요?`);
          if (ok) setSelected(null);
        }}
      />
    </div>
  );
}