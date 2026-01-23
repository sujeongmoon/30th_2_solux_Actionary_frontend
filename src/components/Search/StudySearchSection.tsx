import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./StudySearchSection.css";
import noImg from "../../assets/study_noimg.png";
import { type SearchStudyItemComponent } from "../../api/Search/SearchStudy";
import StudyViewModal from "../../pages/StudyDetailPage/StudyViewModal";


interface StudySearchSectionProps {
  studies: SearchStudyItemComponent[];
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const getSafeImg = (url?: string | null) => {
  if (!url) return noImg;
  if (url === "null" || url === "undefined") return noImg;
  return url;
};

export default function StudySearchSection({ studies }: StudySearchSectionProps) {
  const q = useQuery();
  const location = useLocation();
  const navigate = useNavigate();
  const keyword = (q.get("keyword") ?? "").trim();

  // 모달 열기
  const [selectedStudyId, setSelectedStudyId] = useState<number | null>(null);

  return (
    <>
      <section className="searchSection">
        <div className="searchSectionHeader">
          <div className="searchHeaderLeft">
            <h2 className="searchSectionTitle">스터디 검색</h2>
            {keyword ? (
              <div className="searchSectionMeta">키워드: “{keyword}”</div>
            ) : (
              <div className="searchSectionMeta">전체 스터디</div>
            )}
          </div>
        </div>

        {studies.length === 0 ? (
          <div className="searchState empty">검색 결과가 없어요.</div>
        ) : (
          <div className="searchStudyWrap">
            {studies.map((s) => (
              <article
                key={s.studyId}
                className="searchStudyCard"
                role="button"
                tabIndex={0}
                onClick={() => setSelectedStudyId(s.studyId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSelectedStudyId(s.studyId);
                }}
              >
                <div
                  className="searchStudyThumb"
                  style={{
                    backgroundImage: `url("${(s.thumbnailUrl ?? "").trim()}"), url("${noImg}")`,
                  }}
                >

                  <div className="searchStudyTitleBar">
                    <div className="searchStudyName">{s.title}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedStudyId !== null && (
        <StudyViewModal
          open={true}
          studyId={selectedStudyId}
          onClose={() => setSelectedStudyId(null)}
          onDeleted={() => {
            navigate(location.pathname + location.search, { replace: true });
            navigate(0);
          }}
          onUnlike={(unlikedId) => {
            setMyStudies(prev =>
              prev.filter(study => study.studyId !== unlikedId)
            );
          }}
        />
      )}

      <div className="ss-bottom-section">
        <button className="ss-btn-load-more" onClick={() => navigate("/studies")}>
          더보기 &gt;
        </button>
      </div>
    </>
  );
}