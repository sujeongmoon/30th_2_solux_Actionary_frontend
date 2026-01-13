import "./StudyPage.css";
import '../HomePage/HomePage.css';
import StudyNoImg from "../../assets/study_noimg.png";
import MyStudyCarousel from "./MyStudyCarousel";
import CTABox from "../../components/HomePage/CTAbox";

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

  return (
    <>
      {/* 상단바 */}
      <nav className="sub-navigation">
        <a href="/studies" className="nav-link-home-link">스터디</a>
        <span className="nav-divider">|</span>
        <a href="/" className="nav-link">홈</a>
        <span className="nav-divider">|</span>
        <a href="/board" className="nav-link">게시판</a>
      </nav>
      <div className="sub-nav-divider"></div>

      {myStudies.length > 0 ? (
        <MyStudyCarousel
          myStudies={myStudies}
          myFilter={myFilter}
          setMyFilter={setMyFilter}
          onOpenStudy={onOpenStudy}
        />
      ) : (
        <CTABox
          isLoggedIn={true}
          nickname={props.nickname}
        />
      )}

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