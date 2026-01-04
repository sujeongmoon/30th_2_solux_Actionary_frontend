import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudies } from "../../api/studies";
import type { StudySummary, Visibility } from "../../types/StudyType";
import "./StudyPage.css";

const CATEGORIES = ["전체", "수능", "공무원", "임용", "자격증", "어학", "취업", "기타"] as const;

//FE에서 임시
const PAGE_SIZE = 12;

function visibilityLabel(v?: Visibility) {
  if (v === "public") return "공개";
  if (v === "private") return "비공개";
  return "전체";
}

function buildPageNumbers(current: number, totalPages: number, maxButtons = 5) {
  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(totalPages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);

  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
}

export default function StudyPage() {
  const navigate = useNavigate();

  const [visibility, setVisibility] = useState<Visibility | "all">("all");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("전체");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<StudySummary[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalPages = useMemo(() => {
    if (typeof totalCount !== "number") return null;
    return Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  }, [totalCount]);

  const pageNumbers = useMemo(() => {
    if (!totalPages) return [];
    return buildPageNumbers(page, totalPages, 5);
  }, [page, totalPages]);

  // 필터 바뀌면 page 1로 리셋
  const onChangeVisibility = (v: Visibility | "all") => {
    setVisibility(v);
    setPage(1);
  };

  const onChangeCategory = (c: (typeof CATEGORIES)[number]) => {
    setCategory(c);
    setPage(1);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErrorMsg(null);

    const params: { visibility?: Visibility; category?: string; page?: number } = {
      page,
    };

    if (visibility !== "all") params.visibility = visibility;
    if (category !== "전체") params.category = category;

    getStudies(params)
      .then((data) => {
        if (!mounted) return;
        setItems(data.studies ?? []);
        setTotalCount(typeof data.totalCount === "number" ? data.totalCount : null);
      })
      .catch((e) => {
        if (!mounted) return;
        setItems([]);
        setTotalCount(null);
        setErrorMsg(e?.message ?? "스터디 목록을 불러오지 못했어요.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [visibility, category, page]);

  // totalPages가 생겼는데 page가 범위 밖이면 보정
  useEffect(() => {
    if (!totalPages) return;
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  return (
    <div className="studyPage">
      {/* 상단 그라데이션 카드 + 버튼 */}
      <section className="hero">
        <div className="heroCard">
          <div className="heroText">
            <div className="heroKicker">스터디</div>
            <div className="heroTitle">새로운 스터디를 만들어보세요</div>
            <div className="heroSub">관심 있는 분야의 스터디를 찾아 참여할 수도 있어요.</div>
          </div>

          <button className="heroPlus" type="button" onClick={() => navigate("/studies/new")}>
            +
          </button>
        </div>
      </section>

      {/* 필터 */}
      <section className="filterBar">
        <div className="pillRow">
          <button
            type="button"
            className={`pill ${visibility === "all" ? "active" : ""}`}
            onClick={() => onChangeVisibility("all")}
          >
            전체
          </button>
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
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`pill ${category === c ? "active" : ""}`}
              onClick={() => onChangeCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* 컨텐츠 */}
      <section className="content">
        {loading && <div className="state">불러오는 중…</div>}

        {!loading && errorMsg && <div className="state error">{errorMsg}</div>}

        {!loading && !errorMsg && items.length === 0 && (
          <div className="state empty">조건에 맞는 스터디가 없어요.</div>
        )}

        {!loading && !errorMsg && items.length > 0 && (
          <div className="grid">
            {items.map((s) => (
              <article key={s.studyId} className="card">
                <div className="thumb">
                  {s.thumbnailUrl ? (
                    <img src={s.thumbnailUrl} alt="" />
                  ) : (
                    <div className="thumbFallback" />
                  )}
                </div>

                <div className="cardBody">
                  <div className="cardTitle">{s.title}</div>

                  <div className="chipRow">
                    <span className="chip">{s.category ?? category ?? "기타"}</span>
                    <span className={`chip ${s.visibility === "private" ? "chipPrivate" : "chipPublic"}`}>
                      {visibilityLabel(s.visibility)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 페이지네이션 */}
      <div className="pager">
        <button
          className="pageBtn"
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
        >
          ‹
        </button>

        {totalPages ? (
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
        ) : (
          <div className="pageNumText">Page {page}</div>
        )}

        <button
          className="pageBtn"
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={(totalPages ? page >= totalPages : false) || loading}
        >
          ›
        </button>
      </div>
    </div>
  );
}