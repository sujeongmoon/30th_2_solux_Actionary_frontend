import { useState, useMemo } from "react";
import StudyNoImg from "../../assets/study_noimg.png";
import "./StudyPage.css";

type Study = {
  studyId: number;
  studyName: string;
  coverImage?: string | null;
  category?: string | null;
};

type MyStudyCarouselProps = {
  myStudies: Study[];
  myFilter: string;
  setMyFilter: (f: string) => void;
  onOpenStudy: (id: number) => void;
};

const CATEGORY_LABEL: Record<string, string> = {
  CSAT: "수능",
  CIVIL_SERVICE: "공무원",
  TEACHER_EXAM: "임용",
  LICENSE: "자격증",
  LANGUAGE: "어학",
  EMPLOYMENT: "취업",
  OTHER: "기타",
};

const ORDERED_CATEGORIES = [
  "CSAT",
  "CIVIL_SERVICE",
  "TEACHER_EXAM",
  "LICENSE",
  "LANGUAGE",
  "EMPLOYMENT",
  "OTHER",
] as const;

export default function MyStudyCarousel({
  myStudies,
  myFilter,
  setMyFilter,
  onOpenStudy,
}: MyStudyCarouselProps) {
  const visibleMy = 3;

  const [indexByCat, setIndexByCat] = useState<Record<string, number>>({});

  const setFilterSafe = (f: string) => {
    setIndexByCat({}); 
    setMyFilter(f);
  };

  const filterLabel = (f: string) => {
    if (f === "ALL") return "전체";
    if (f === "OWNED") return "개설한 스터디";
    if (f === "JOINED") return "참가한 스터디";
    if (f === "LIKED") return "즐겨찾기";
    return f;
  };

  const grouped = useMemo(() => {
    const g: Record<string, Study[]> = {};
    (myStudies ?? []).forEach((s) => {
      const key = (s.category || "OTHER").trim() || "OTHER";
      if (!g[key]) g[key] = [];
      g[key].push(s);
    });
    return g;
  }, [myStudies]);

  const totalCount = myStudies?.length ?? 0;

  const canPrev = (cat: string) => (indexByCat[cat] ?? 0) > 0;
  const canNext = (cat: string, len: number) =>
    (indexByCat[cat] ?? 0) + visibleMy < len;

  const move = (cat: string, delta: number, len: number) => {
    setIndexByCat((prev) => {
      const cur = prev[cat] ?? 0;
      const maxStart = Math.max(0, len - visibleMy);
      const next = Math.max(0, Math.min(cur + delta, maxStart));
      return { ...prev, [cat]: next };
    });
  };

  const sliceFor = (cat: string, list: Study[]) => {
    const start = indexByCat[cat] ?? 0;
    return list.slice(start, start + visibleMy);
  };

  return (
    <section className="myStudySection">
      {/* ===== Header ===== */}
      <div className="myStudyHeader">
        <div className="myStudyTitle">나만의 스터디</div>

        <div className="myStudyMeta">
          {["ALL", "OWNED", "JOINED", "LIKED"].map((f, idx) => (
            <span key={f}>
              <button
                type="button"
                className={`metaBtn ${myFilter === f ? "active" : ""}`}
                onClick={() => setFilterSafe(f)}
              >
                {myFilter === f && <span className="dotOn">✓</span>}
                {filterLabel(f)}
              </button>
              {idx < 3 && <span className="metaSep">·</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ===== Empty State (배경 유지) ===== */}
      {totalCount === 0 ? (
        <div className="myStudyCarousel">
          <div className="myStudyCards">
            <div className="state empty" style={{ padding: "20px 0" }}>
              해당 스터디가 없습니다.
            </div>
          </div>
        </div>
      ) : (
        /* ===== Category Rows ===== */
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {ORDERED_CATEGORIES.map((cat) => {
            const list = grouped[cat] ?? [];
            if (list.length === 0) return null;

            const prev = canPrev(cat);
            const next = canNext(cat, list.length);
            const sliced = sliceFor(cat, list);

            return (
              <div key={cat}>
                {/* 카테고리 타이틀 */}
                <div
                  className="myStudyTitle"
                  style={{ fontSize: 16, marginBottom: 10 }}
                >
                  {CATEGORY_LABEL[cat] ?? cat}
                </div>

                {/* 카테고리별 캐러셀 */}
                <div className="myStudyCarousel">
                  <button
                    type="button"
                    className={`arrowBtn ${prev ? "" : "disabled"}`}
                    onClick={() => prev && move(cat, -1, list.length)}
                  >
                    ‹
                  </button>

                  <div className="myStudyCards">
                    {sliced.map((s) => (
                      <div
                        key={s.studyId}
                        className="myStudyCard"
                        onClick={() => onOpenStudy(s.studyId)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onOpenStudy(s.studyId);
                        }}
                      >
                        <div className="myStudyThumb">
                          <img
                            src={s.coverImage || StudyNoImg}
                            alt=""
                            className={!s.coverImage ? "noImage" : ""}
                          />
                          <div className="titlePill">
                            <div className="titlePillText">
                              {s.studyName || "제목"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={`arrowBtn ${next ? "" : "disabled"}`}
                    onClick={() => next && move(cat, +1, list.length)}
                  >
                    ›
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}