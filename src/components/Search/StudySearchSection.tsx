import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./StudySearchSection.css";
import noImg from "../../assets/study_noimg.png";
import { searchAll } from "../../api/Search/SearchAll";
import { type SearchStudyItemComponent } from "../../api/Search/SearchStudy";


interface StudySearchSectionProps {
  studies: SearchStudyItemComponent[];
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function StudySearchSection({ studies }: StudySearchSectionProps) {
  const q = useQuery();
  const navigate = useNavigate();
  const keyword = (q.get("keyword") ?? "").trim();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SearchStudyItemComponent[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  useEffect(() => {
    if (!keyword) return;

    let mounted = true;
    setErrorMsg(null);
    setLoading(true);

    searchAll(keyword)
      .then(res => {
        if (!mounted) return;
        setItems(res.data.data.studies);
      })
      .catch(()=> {
        if (!mounted) return;
        setErrorMsg('검색 중 오류가 발생했습니다.');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

      return () => { mounted = false };
  },[keyword]);

  return (
    <section className="searchSection">
      {/* 헤더: 왼쪽 제목/키워드 + 오른쪽 정렬 필터 */}
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

      {loading && <div className="searchState">불러오는 중...</div>}
      {!loading && errorMsg && <div className="searchState error">{errorMsg}</div>}
      {!loading && !errorMsg && items.length === 0 && (
        <div className="searchState empty">검색 결과가 없어요.</div>
      )}

      {!loading && !errorMsg && items.length > 0 && (
        <div className="searchStudyWrap">
          {studies.map((s) => (
            <article
              key={s.studyId}
              className="searchStudyCard"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/studies/${s.studyId}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/studies/${s.studyId}`);
              }}
            >
              <div
                className="searchStudyThumb"
                style={{ backgroundImage: `url(${s.thumbnailUrl ?? noImg})` }}
              >
                <div className="searchStudyChips">
                  <span className={`searchStudyChip ${s.isJoined ? "pub" : "pri"}`}>
                    {s.isJoined ? "참여중" : "미참여"}
                  </span>
                  <span className="searchStudyChip ghost">{s.category ?? "기타"}</span>
                </div>

                <div className="searchStudyTitleBar">
                  <div className="searchStudyName">{s.title}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}