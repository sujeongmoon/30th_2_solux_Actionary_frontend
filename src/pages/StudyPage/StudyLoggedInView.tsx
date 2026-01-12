import { useMemo, useState } from "react";
import "./StudyPage.css";
import StudyNoImg from "../../assets/study_noimg.png";

type Props = any;

export default function StudyLoggedInView(props: Props) {
  const {
    navigate,

    myStudies,
    myFilter,
    setMyFilter,

    visibility,
    categoryLabel,
    CATEGORY_OPTIONS,
    onChangeVisibility,
    onChangeCategory,

    items,
    loading,
    errorMsg,

    page,
    totalPages,
    pageNumbers,
    totalElements,
    setPage,

    onOpenStudy,
  } = props;

  // 나만의 스터디 캐러셀
  const [myIndex, setMyIndex] = useState(0);
  const visibleMy = 3;

  const mySlice = useMemo(() => {
    const start = myIndex;
    return (myStudies ?? []).slice(start, start + visibleMy);
  }, [myIndex, myStudies]);

  const canPrev = myIndex > 0;
  const canNext = (myStudies?.length ?? 0) > myIndex + visibleMy;

  const setFilterSafe = (f: any) => {
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
    <>
      {/* 상단바 */}
      <div className="pageShell">
        <nav className="sub-navigation">
          <a href="/studies" className="nav-link-home-link">스터디</a>
          <span className="nav-divider">|</span>
          <a href="/" className="nav-link">홈</a>
          <span className="nav-divider">|</span>
          <a href="/board" className="nav-link">게시판</a>
        </nav>
        <div className="divider" />
      </div>

      {/* ===== 나만의 스터디 ===== */}
      <section className="myStudySection likeMock">
        <div className="myStudyHeader">
          <div className="myStudyTitle">나만의 스터디</div>

          <div className="myStudyMeta">
            <span className="dotOn">✓</span>

            <button
              type="button"
              className={`metaBtn ${myFilter === "ALL" ? "active" : ""}`}
              onClick={() => setFilterSafe("ALL")}
            >
              {filterLabel("ALL")}
            </button>
            <span className="metaSep">·</span>

            <button
              type="button"
              className={`metaBtn ${myFilter === "CREATED" ? "active" : ""}`}
              onClick={() => setFilterSafe("CREATED")}
            >
              {filterLabel("CREATED")}
            </button>
            <span className="metaSep">·</span>

            <button
              type="button"
              className={`metaBtn ${myFilter === "JOINED" ? "active" : ""}`}
              onClick={() => setFilterSafe("JOINED")}
            >
              {filterLabel("JOINED")}
            </button>
            <span className="metaSep">·</span>

            <button
              type="button"
              className={`metaBtn ${myFilter === "FAVORITE" ? "active" : ""}`}
              onClick={() => setFilterSafe("FAVORITE")}
            >
              {filterLabel("FAVORITE")}
            </button>
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
            {mySlice.map((s: any) => (
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
                  {/* ✅ 캡슐을 thumb 안으로 넣어서 카드랑 동일 룩 */}
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

      {/* ===== 전체 스터디 ===== */}
      <section className="listWrap">
        <div className="listTop">
          <div className="visTabs">
            <button
              type="button"
              className={`visTab ${visibility === "public" ? "active" : ""}`}
              onClick={() => onChangeVisibility("public")}
            >
              공개
            </button>
            <span className="visSep">|</span>
            <button
              type="button"
              className={`visTab ${visibility === "private" ? "active" : ""}`}
              onClick={() => onChangeVisibility("private")}
            >
              비공개
            </button>
          </div>

          {/* ✅ 게스트랑 동일 구조 */}
          <div className="rightInfo">
            <div className="totalText">총 {totalElements}개 스터디</div>
            <div className="catTextRow">
              {CATEGORY_OPTIONS.map((opt: any, idx: number) => (
                <span key={opt.label} className="catTextItem">
                  {idx === 0 ? (
                    <span className={`catCheck ${categoryLabel === opt.label ? "on" : ""}`}>✓</span>
                  ) : (
                    <span className="catDot">·</span>
                  )}

                  <button
                    type="button"
                    className={`catTextBtn ${categoryLabel === opt.label ? "active" : ""}`}
                    onClick={() => onChangeCategory(opt.label, opt.value)}
                  >
                    {opt.label}
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <section className="studyContent">
          {loading && <div className="state">불러오는 중…</div>}
          {!loading && errorMsg && <div className="state error">{errorMsg}</div>}
          {!loading && !errorMsg && items.length === 0 && (
            <div className="state empty">조건에 맞는 스터디가 없어요.</div>
          )}

          {!loading && !errorMsg && items.length > 0 && (
            <div className="studyGrid">
              {items.map((s: any) => (
                <article
                  key={s.studyId}
                  className="studyCard"
                  onClick={() => onOpenStudy(s.studyId)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="studyThumb">
                    <img
                      src={s.coverImage || StudyNoImg}
                      alt=""
                      className={!s.coverImage ? "noImage" : ""}
                    />
                    <div className="titlePill">
                      <div className="titlePillText">{s.studyName}</div>
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
            onClick={() => setPage((p: number) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            ‹
          </button>

          <div className="pageNums">
            {pageNumbers.map((p: number) => (
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

          <button
            className="pageBtn"
            type="button"
            onClick={() => setPage((p: number) => p + 1)}
            disabled={page >= totalPages || loading}
          >
            ›
          </button>
        </div>
      </section>
    </>
  );
}