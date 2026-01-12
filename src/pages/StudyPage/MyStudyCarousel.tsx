import { useState, useMemo } from "react";
import StudyNoImg from "../../assets/study_noimg.png";
import "./StudyPage.css";

type Study = {
  studyId: number;
  studyName: string;
  coverImage?: string | null;
};

type MyStudyCarouselProps = {
  myStudies: Study[];
  myFilter: string;
  setMyFilter: (f: string) => void;
  onOpenStudy: (id: number) => void;
};

export default function MyStudyCarousel({ myStudies, myFilter, setMyFilter, onOpenStudy }: MyStudyCarouselProps) {
  const [myIndex, setMyIndex] = useState(0);
  const visibleMy = 3;

  const mySlice = useMemo(() => {
    const start = myIndex;
    return (myStudies ?? []).slice(start, start + visibleMy);
  }, [myIndex, myStudies]);

  const canPrev = myIndex > 0;
  const canNext = (myStudies?.length ?? 0) > myIndex + visibleMy;

  const setFilterSafe = (f: string) => {
    setMyIndex(0);
    setMyFilter(f);
  };

  const filterLabel = (f: string) => {
    if (f === "ALL") return "전체";
    if (f === "CREATED") return "개설한 스터디";
    if (f === "JOINED") return "참가한 스터디";
    if (f === "FAVORITE") return "즐겨찾기";
    return f;
  };

  return (
    <section className="myStudySection">
      <div className="myStudyHeader">
        <div className="myStudyTitle">나만의 스터디</div>

        <div className="myStudyMeta">
        {["ALL", "CREATED", "JOINED", "FAVORITE"].map((f, idx) => (
  <span key={f}>
    <button
      type="button"
      className={`metaBtn ${myFilter === f ? "active" : ""}`}
      onClick={() => setFilterSafe(f)}
    >
      {myFilter === f && <span className="dotOn">✓</span>} {/* active일 때만 체크 표시 */}
      {filterLabel(f)}
    </button>
    {idx < 3 && <span className="metaSep">·</span>}
  </span>
))}

        </div>
      </div>

      <div className="myStudyCarousel">
        <button
          type="button"
          className={`arrowBtn ${canPrev ? "" : "disabled"}`}
          onClick={() => canPrev && setMyIndex((v) => Math.max(0, v - 1))}
        >
          ‹
        </button>

        <div className="myStudyCards">
          {mySlice.map((s) => (
            <div
              key={s.studyId}
              className="myStudyCard"
              onClick={() => onOpenStudy(s.studyId)}
              role="button"
              tabIndex={0}
            >
              <div className="myStudyThumb">
                <img
                  src={s.coverImage || StudyNoImg}
                  alt=""
                  className={!s.coverImage ? "noImage" : ""}
                />
                <div className="titlePill">
                  <div className="titlePillText">{s.studyName || "제목"}</div>
                </div>
              </div>
            </div>
          ))}

          {(myStudies?.length ?? 0) === 0 && (
            <div className="state empty" style={{ padding: "20px 0" }}>
              조건에 맞는 나만의 스터디가 없어요.
            </div>
          )}
        </div>

        <button
          type="button"
          className={`arrowBtn ${canNext ? "" : "disabled"}`}
          onClick={() => canNext && setMyIndex((v) => v + 1)}
        >
          ›
        </button>
      </div>
    </section>
  );
}
