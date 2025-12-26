import { useEffect, useMemo, useState } from "react";
import { getStudies } from "../../api/studies";
import type { StudySummary, Visibility } from "../../types/StudyType";
import "./StudyPage.css";

const CATEGORIES = ["전체", "수능", "공무원", "임용", "자격증", "어학", "취업", "기타"];

export default function StudyPage() {
  const [visibility, setVisibility] = useState<Visibility | "all">("all");
  const [category, setCategory] = useState("전체");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<StudySummary[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const params = useMemo(
    () => ({
      visibility: visibility === "all" ? undefined : visibility,
      category: category === "전체" ? undefined : category,
      page,
    }),
    [visibility, category, page]
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getStudies(params)
      .then((res) => {
        if (!mounted) return;
        setItems(res.studies ?? []);
        setTotalCount(typeof res.totalCount === "number" ? res.totalCount : null);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [params]);

  return (
    <div className="studyPage">
      <h1 className="studyTitle">스터디</h1>

      <section className="hero">
        <button className="heroPlus" type="button" onClick={() => alert("스터디 생성 이동")}>
          +
        </button>
        <div className="heroText">지금 로그인 하고, 나만의 스터디를 만들어보세요 !</div>
      </section>

      <section className="toolbar">
        <div className="count">
          총 <strong>{totalCount ?? "-"}</strong>개 스터디
        </div>
        <div className="vis">
          <button className={`pill ${visibility === "public" ? "active" : ""}`} onClick={() => setVisibility("public")}>
            공개
          </button>
          <button
            className={`pill ${visibility === "private" ? "active" : ""}`}
            onClick={() => setVisibility("private")}
          >
            비공개
          </button>
          <button className={`pill ${visibility === "all" ? "active" : ""}`} onClick={() => setVisibility("all")}>
            전체
          </button>
        </div>
      </section>

      <section className="cats">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`pill ${category === c ? "active" : ""}`}
            onClick={() => {
              setCategory(c);
              setPage(1);
            }}
          >
            {c}
          </button>
        ))}
      </section>

      {loading ? (
        <div className="state">불러오는 중…</div>
      ) : (
        <section className="grid">
          {items.map((s) => (
            <article key={s.studyId} className="card">
              <div className="thumb">
                {s.thumbnailUrl ? <img src={s.thumbnailUrl} alt={s.title} /> : <div className="ph" />}
                <div className="overlay">{s.title}</div>
              </div>
            </article>
          ))}
        </section>
      )}

      <div className="pager">
        <button className="pageBtn" onClick={() => setPage((p) => Math.max(1, p - 1))}>
          ‹
        </button>
        <div className="pageNum">Page {page}</div>
        <button className="pageBtn" onClick={() => setPage((p) => p + 1)}>
          ›
        </button>
      </div>
    </div>
  );
}
