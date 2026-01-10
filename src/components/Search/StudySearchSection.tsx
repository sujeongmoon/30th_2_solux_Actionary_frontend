import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./StudySearchSection.css";

type StudyItem = {
  studyId: number;
  studyName: string;
  coverImage?: string | null;
  isPublic?: boolean;
  categoryLabel?: string;
};

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

/** API 붙이기 전 목업 */
const USE_MOCK = true;
const MOCK_STUDIES: StudyItem[] = [
  { studyId: 1, studyName: "같이 공부해요", coverImage: null, isPublic: true, categoryLabel: "기타" },
  { studyId: 2, studyName: "공무원 한국사", coverImage: null, isPublic: true, categoryLabel: "공무원" },
  { studyId: 3, studyName: "토익 900+", coverImage: null, isPublic: true, categoryLabel: "어학" },
  { studyId: 6, studyName: "비공개 스터디", coverImage: null, isPublic: false, categoryLabel: "임용" },
];

export default function StudySearchSection() {
  const q = useQuery();
  const navigate = useNavigate();

  const keyword = (q.get("keyword") ?? "").trim();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<StudyItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setErrorMsg(null);
    setLoading(true);

    // 목업 검색
    if (USE_MOCK) {
      const lower = keyword.toLowerCase();
      const filtered = keyword
        ? MOCK_STUDIES.filter((s) => s.studyName.toLowerCase().includes(lower))
        : MOCK_STUDIES;

      if (!mounted) return;
      setItems(filtered);
      setLoading(false);
      return;
    }

    // TODO: 백엔드 스터디 검색 API 붙이면 여기에 호출
    // getStudySearch({ keyword }) 같은 형태로
    setLoading(false);

    return () => {
      mounted = false;
    };
  }, [keyword]);

  return (
    <section className="searchSection">
      <div className="searchSectionHeader">
        <h2 className="searchSectionTitle">스터디 검색</h2>
        {keyword ? <div className="searchSectionMeta">키워드: “{keyword}”</div> : <div className="searchSectionMeta">전체 스터디</div>}
      </div>

      {loading && <div className="searchState">불러오는 중…</div>}
      {!loading && errorMsg && <div className="searchState error">{errorMsg}</div>}
      {!loading && !errorMsg && items.length === 0 && <div className="searchState empty">검색 결과가 없어요.</div>}

      {!loading && !errorMsg && items.length > 0 && (
        <div className="searchStudyGrid">
          {items.map((s) => (
            <article
              key={s.studyId}
              className="searchStudyCard"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/studies/${s.studyId}`)} 
            >
              <div className="searchStudyThumb" />
              <div className="searchStudyBody">
                <div className="searchStudyName">{s.studyName}</div>
                <div className="searchStudySub">
                  <span className={`badge ${s.isPublic ? "pub" : "pri"}`}>{s.isPublic ? "공개" : "비공개"}</span>
                  <span className="badge ghost">{s.categoryLabel ?? "기타"}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}