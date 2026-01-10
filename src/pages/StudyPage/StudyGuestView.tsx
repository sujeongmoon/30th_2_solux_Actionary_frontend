import "./StudyPage.css";
import StudyNoImg from "../../assets/study_noimg.png";
type Props = any;

export default function StudyGuestView(props: Props) {
  const {
    navigate,
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
    size,
    totalElements,
    setPage,
    onOpenStudy,
  } = props;

  return (
    <>
      {/* 상단 배너 (게스트 버전) */}
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
          <button type="button" className={`pill ${visibility === "public" ? "active" : ""}`} onClick={() => onChangeVisibility("public")}>
            공개
          </button>
          <button type="button" className={`pill ${visibility === "private" ? "active" : ""}`} onClick={() => onChangeVisibility("private")}>
            비공개
          </button>
        </div>

        <div className="pillRow scroll">
          {CATEGORY_OPTIONS.map((opt: any) => (
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
            {items.map((s: any) => (
              <article key={s.studyId} className="studyCard" onClick={() => onOpenStudy(s.studyId)} role="button" tabIndex={0}>
                <div className="studyThumb">
                <img
                    src={s.coverImage || StudyNoImg}
                    alt=""
                    className={!s.coverImage ? "noImage" : ""}
                />
                  <div className="thumbDim" />
                  <div className="thumbChips">
                    <span className={`chip ${s.isPublic ? "chipPublic" : "chipPrivate"}`}>{s.isPublic ? "공개" : "비공개"}</span>
                    <span className="chip chipGhost">{categoryLabel}</span>
                  </div>
                </div>

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
        <button className="pageBtn" type="button" onClick={() => setPage((p: number) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>
          ‹
        </button>

        <div className="pageNums">
          {pageNumbers.map((p: number) => (
            <button key={p} type="button" className={`pageNumBtn ${p === page ? "active" : ""}`} onClick={() => setPage(p)} disabled={loading}>
              {p}
            </button>
          ))}
        </div>

        <button className="pageBtn" type="button" onClick={() => setPage((p: number) => p + 1)} disabled={page >= totalPages || loading}>
          ›
        </button>
      </div>
    </>
  );
}