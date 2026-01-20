import StudyNoImg from "../../assets/study_noimg.png";
import "./StudyPage.css";

export type MyScope = "ALL" | "OWNED" | "JOINED" | "LIKED";

type Study = {
  studyId: number;
  studyName: string;
  coverImage?: string | null;
};

type MyStudyCarouselProps = {
  myStudies: Study[];
  myFilter: MyScope;
  setMyFilter: (f: MyScope) => void;
  onOpenStudy: (id: number) => void;

  myPage: number;
  setMyPage: (p: number | ((prev: number) => number)) => void;
  myTotalPages: number;

  title?: string;
};

const FILTERS: Array<{ key: MyScope; label: string }> = [
  { key: "ALL", label: "전체" },
  { key: "OWNED", label: "개설한 스터디" },
  { key: "JOINED", label: "참가한 스터디" },
  { key: "LIKED", label: "즐겨찾기" },
];

export default function MyStudyCarousel({
  myStudies,
  myFilter,
  setMyFilter,
  onOpenStudy,
  myPage,
  setMyPage,
  myTotalPages,
  title = "나만의 스터디",
}: MyStudyCarouselProps) {
  const totalCount = myStudies?.length ?? 0;

  const canPrev = myPage > 1;
  const canNext = myPage < (myTotalPages ?? 1);

  const setFilterSafe = (f: MyScope) => {
    // StudyPage에서 myFilter 변경 시 myPage=1로 리셋해줌
    setMyFilter(f);
  };

  return (
    <section className="myStudySection likeMock">
      {/* Header */}
      <div className="myStudyHeader">
        <div className="myStudyTitle">{title}</div>

        <div className="myStudyMeta">
          {FILTERS.map((f, idx) => (
            <span key={f.key}>
              <button
                type="button"
                className={`metaBtn ${myFilter === f.key ? "active" : ""}`}
                onClick={() => setFilterSafe(f.key)}
              >
                {myFilter === f.key && <span className="dotOn">✓</span>}
                {f.label}
              </button>
              {idx < FILTERS.length - 1 && <span className="metaSep">·</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Carousel */}
      <div className="myStudyCarousel">
        {totalCount > 0 ? (
          <button
            type="button"
            className={`arrowBtn ${canPrev ? "" : "disabled"}`}
            onClick={() => canPrev && setMyPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev}
            aria-label="previous"
          >
            ‹
          </button>
        ) : (
          <span style={{ width: 40 }} />
        )}

        <div className="myStudyCards">
          {totalCount === 0 ? (
            <div className="myStudyEmptyText">조건에 맞는 나만의 스터디가 없어요.</div>
          ) : (
            myStudies.map((s) => (
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
                  src={s.coverImage ? s.coverImage : StudyNoImg}
                  alt=""
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src.endsWith("study_noimg.png")) return; 
                    img.src = StudyNoImg;
                  }}
                />
                  <div className="titlePill">
                    <div className="titlePillText">{s.studyName || "제목"}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {totalCount > 0 ? (
          <button
            type="button"
            className={`arrowBtn ${canNext ? "" : "disabled"}`}
            onClick={() => canNext && setMyPage((p) => p + 1)}
            disabled={!canNext}
            aria-label="next"
          >
            ›
          </button>
        ) : (
          <span style={{ width: 40 }} />
        )}
      </div>

      {/* ✅ (선택) 페이지 표시: 필요 없으면 삭제 가능 */}
      {totalCount > 0 && myTotalPages > 1 && (
        <div style={{ textAlign: "center", fontSize: 12, color: "#999", marginTop: 6 }}>
          {myPage} / {myTotalPages}
        </div>
      )}
    </section>
  );
}