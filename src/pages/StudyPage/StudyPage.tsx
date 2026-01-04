import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudies } from "../../api/studies";
import "./StudyPage.css";

/** ===== 명세 기준(추후 API 연동) =====
 * GET /api/studies?visibility={public/private}&category={category}&page={pageNumber}
 * 응답: data.content, data.totalElements, data.totalPages, data.page, data.size
 */

type VisibilityParam = "public" | "private";

type CategoryEnum =
  | "CSAT"
  | "CIVIL_SERVICE"
  | "TEACHER_EXAM"
  | "LICENSE"
  | "LANGUAGE"
  | "EMPLOYMENT"
  | "OTHER";

const CATEGORY_OPTIONS: { label: string; value?: CategoryEnum }[] = [
  { label: "전체", value: undefined },
  { label: "수능", value: "CSAT" },
  { label: "공무원", value: "CIVIL_SERVICE" },
  { label: "임용", value: "TEACHER_EXAM" },
  { label: "자격증", value: "LICENSE" },
  { label: "어학", value: "LANGUAGE" },
  { label: "취업", value: "EMPLOYMENT" },
  { label: "기타", value: "OTHER" },
];

type StudyListItem = {
  studyId: number;
  studyName: string;
  coverImage?: string | null;
};

type StudiesListResponse = {
  success: boolean;
  message: string;
  data: {
    content: StudyListItem[];
    page: number; // 0-based
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

function buildPageNumbers(current: number, totalPages: number, maxButtons = 5) {
  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(totalPages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
}

/** ✅ API 아직이면 이거 true로 두면 됨 */
const USE_MOCK = true;

/** 목업 데이터(이미지는 아무 url 써도 됨 / 없으면 회색 박스) */
const MOCK_ITEMS: StudyListItem[] = [
  { studyId: 1, studyName: "같이 공부해요", coverImage: "https://picsum.photos/seed/study1/600/600" },
  { studyId: 2, studyName: "공무원 한국사", coverImage: "https://picsum.photos/seed/study2/600/600" },
  { studyId: 3, studyName: "토익 900+", coverImage: "https://picsum.photos/seed/study3/600/600" },
  { studyId: 4, studyName: "자격증 스터디", coverImage: null },
  { studyId: 5, studyName: "임용 오전반", coverImage: "https://picsum.photos/seed/study5/600/600" },
  { studyId: 6, studyName: "취업 코테", coverImage: "https://picsum.photos/seed/study6/600/600" },
  { studyId: 7, studyName: "수능 국어", coverImage: null },
  { studyId: 8, studyName: "기타 모임", coverImage: "https://picsum.photos/seed/study8/600/600" },
];

export default function StudyPage() {
  const navigate = useNavigate();

  // 기본값 공개
  const [visibility, setVisibility] = useState<VisibilityParam>("public");
  const [categoryLabel, setCategoryLabel] = useState<string>("전체");
  const [category, setCategory] = useState<CategoryEnum | undefined>(undefined);
  const [selected, setSelected] = useState<StudyListItem | null>(null);

  // UI는 1-based
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<StudyListItem[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [size, setSize] = useState<number>(8);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pageNumbers = useMemo(() => buildPageNumbers(page, totalPages, 5), [page, totalPages]);

  const onChangeVisibility = (v: VisibilityParam) => {
    setVisibility(v);
    setPage(1);
  };

  const onChangeCategory = (label: string, value?: CategoryEnum) => {
    setCategoryLabel(label);
    setCategory(value);
    setPage(1);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErrorMsg(null);

    // ✅ 목업이면 API 안 타고 UI만 확인
    if (USE_MOCK) {
      const fakeSize = 8;
      const fakeTotalElements = MOCK_ITEMS.length;
      const fakeTotalPages = Math.max(1, Math.ceil(fakeTotalElements / fakeSize));
      const start = (page - 1) * fakeSize;
      const sliced = MOCK_ITEMS.slice(start, start + fakeSize);

      setItems(sliced);
      setTotalElements(fakeTotalElements);
      setTotalPages(fakeTotalPages);
      setSize(fakeSize);
      setLoading(false);
      return () => {};
    }

    const params: { visibility: VisibilityParam; category?: CategoryEnum; page: number } = {
      visibility,
      page: page - 1,
    };
    if (category) params.category = category;

    getStudies(params)
      .then((res: StudiesListResponse) => {
        if (!mounted) return;
        if (!res?.success) throw new Error(res?.message || "스터디 목록을 불러오지 못했어요.");

        const d = res.data;
        setItems(d.content ?? []);
        setTotalElements(typeof d.totalElements === "number" ? d.totalElements : 0);
        setTotalPages(typeof d.totalPages === "number" ? Math.max(1, d.totalPages) : 1);
        setSize(typeof d.size === "number" ? d.size : 8);
      })
      .catch((e) => {
        if (!mounted) return;
        setItems([]);
        setTotalElements(0);
        setTotalPages(1);
        setSize(8);
        setErrorMsg(e?.message ?? "스터디 목록을 불러오지 못했어요.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [visibility, category, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  return (
    <div className="studyPage">
      {/* 상단 배너 */}
      <section className="studyHero">
        <div className="studyHeroCard">
          <div className="studyHeroLeft">
            <div className="studyHeroKicker">스터디</div>
            <div className="studyHeroTitle">새로운 스터디를 만들어보세요</div>
            <div className="studyHeroSub">관심 있는 분야의 스터디를 찾아 참여할 수도 있어요.</div>
          </div>

          <button className="studyHeroPlus" type="button" onClick={() => navigate("/studies/new")} aria-label="스터디 만들기">
            +
          </button>
        </div>
      </section>

      {/* 필터 */}
      <section className="studyFilters">
        <div className="pillRow">
          <button
            type="button"
            className={`pill ${visibility === "public" ? "active" : ""}`}
            onClick={() => onChangeVisibility("public")}
          >
            공개
          </button>
          <button
            type="button"
            className={`pill ${visibility === "private" ? "active" : ""}`}
            onClick={() => onChangeVisibility("private")}
          >
            비공개
          </button>
        </div>

        <div className="pillRow scroll">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              className={`pill ${categoryLabel === opt.label ? "active" : ""}`}
              onClick={() => onChangeCategory(opt.label, opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* 목록 */}
      <section className="studyContent">
        {loading && <div className="state">불러오는 중…</div>}
        {!loading && errorMsg && <div className="state error">{errorMsg}</div>}
        {!loading && !errorMsg && items.length === 0 && <div className="state empty">조건에 맞는 스터디가 없어요.</div>}

        {!loading && !errorMsg && items.length > 0 && (
          <div className="studyGrid">
            {items.map((s) => (
              <article
                key={s.studyId}
                className="studyCard"
                onClick={() => navigate(`/studies/${s.studyId}`)}
                role="button"
                tabIndex={0}
              >
                <div className="studyThumb">
                  {s.coverImage ? <img src={s.coverImage} alt="" /> : <div className="thumbFallback" />}
                  <div className="thumbDim" />
                  <div className="thumbChips">
                    <span className={`chip ${visibility === "private" ? "chipPrivate" : "chipPublic"}`}>
                      {visibility === "public" ? "공개" : "비공개"}
                    </span>
                    <span className="chip chipGhost">{categoryLabel}</span>
                  </div>
                </div>

                {/* 아래 검은 바(시안 느낌) */}
                <div className="studyBottomBar">
                  <div className="studyName">{s.studyName}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 페이지네이션 */}
      <div className="pager">
        <button className="pageBtn" type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>
          ‹
        </button>

        <div className="pageNums">
          {pageNumbers.map((p) => (
            <button
              key={p}
              type="button"
              className={`pageNumBtn ${p === page ? "active" : ""}`}
              onClick={() => setPage(p)}
              disabled={loading}
            >
              {p}
            </button>
          ))}
        </div>

        <button className="pageBtn" type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages || loading}>
          ›
        </button>
      </div>

      <div className="footMeta">
        총 {totalElements}개 · pageSize {size}
      </div>
    </div>
  );
}