import { useNavigate, useParams } from "react-router-dom";
import "./StudyDetailPage.css";

export default function StudyDetailPage() {
  const navigate = useNavigate();
  const { studyId } = useParams();

  const id = Number(studyId);
  const isValidId = Number.isFinite(id) && id > 0;

  return (
    <div className="studyDetailPage">
      {/* 상단 헤더 */}
      <header className="detailTop">
        <button className="backBtn" onClick={() => navigate(-1)}>←</button>
        <h1>스터디 상세</h1>
        <div />
      </header>

      {!isValidId ? (
        <div className="state error">잘못된 스터디 ID예요.</div>
      ) : (
        <>
          {/* 상단 카드 */}
          <section className="card headerCard">
            <div className="cover skeleton" />
            <div className="headerInfo">
              <div className="chipRow">
                <span className="chip skeletonChip" />
                <span className="chip skeletonChip" />
              </div>
              <h2 className="skeletonLine" />
              <p className="skeletonLine short" />
              <button className="primaryBtn" disabled>입장하기</button>
            </div>
          </section>

          {/* 요약 */}
          <section className="card summary">
            <div className="summaryItem">
              <span>인원</span>
              <div className="skeletonLine" />
            </div>
            <div className="summaryItem">
              <span>공개</span>
              <div className="skeletonLine" />
            </div>
            <div className="summaryItem">
              <span>랭킹</span>
              <div className="skeletonLine" />
            </div>
          </section>

          {/* 소개 */}
          <section className="card">
            <h3>소개</h3>
            <div className="skeletonBlock" />
          </section>

          {/* 규칙 */}
          <section className="card">
            <h3>안내 / 규칙</h3>
            <div className="skeletonBlock" />
          </section>

          {/* 하단 버튼 */}
          <div className="actions">
            <button className="ghostBtn" disabled>즐겨찾기</button>
            <button className="primaryBtn" disabled>참여하기</button>
          </div>

          <p className="hint">
            ※ 현재는 UI 단계이며 기능은 추후 API 연동 예정입니다.
          </p>
        </>
      )}
    </div>
  );
}