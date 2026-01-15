import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../components/Search/StudySearchSection.css";
import noImg from "../../assets/study_noimg.png";
import { searchStudies } from "../../api/studies";

type StudyItem = {
  studyId: number;
  studyName: string;
  coverImage?: string | null;
  isPublic?: boolean;
  categoryLabel?: string;
  createdAt?: string; 
  memberCount?: number; 
};

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

type SortKey = "popular" | "latest";
const sortLabel: Record<SortKey, string> = {
  popular: "인기순",
  latest: "최신순",
};

const toApiSort = (k: SortKey) => (k === "popular" ? "POPULAR" : "RECENT");

export default function StudySearch() {
  const q = useQuery();
  const navigate = useNavigate();
  const keyword = (q.get("keyword") ?? "").trim();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<StudyItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 정렬 상태
  const [sortKey, setSortKey] = useState<SortKey>("popular");
  const [page, setPage] = useState(1);
  const size = 10; 

  // 커스텀 드롭다운 열림/닫힘
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement | null>(null);

  // 바깥 클릭하면 드롭다운 닫기
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!sortRef.current) return;
      if (!sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ESC로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSortOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

// keyword / sort / page 바뀔 때마다 검색
useEffect(() => {
  let mounted = true;

  (async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const data = await searchStudies({
        q: keyword || "", 
        sort: toApiSort(sortKey),
        page, 
        size,
      });

      if (!mounted) return;

      // Paginated<SearchStudyItem> -> StudyItem 매핑
      const mapped: StudyItem[] = (data.content ?? []).map((s: any) => ({
        studyId: s.studyId,
        studyName: s.studyName,
        coverImage: s.coverImage ?? null,
        isPublic: s.isPublic,
        categoryLabel: s.categoryLabel ?? "기타",
        createdAt: s.createdAt,
        memberCount: s.memberCount,
      }));

      setItems(mapped);
    } catch (e: any) {
      if (!mounted) return;
      setItems([]);
      setErrorMsg(e?.response?.data?.message ?? "검색 결과를 불러오지 못했어요.");
    } finally {
      if (mounted) setLoading(false);
    }
  })();

  return () => {
    mounted = false;
  };
}, [keyword, sortKey, page]);

  // 정렬 (백에서 정렬해주면 제거 가능)
  const sortedItems = useMemo(() => items, [items]);

  const chooseSort = (k: SortKey) => {
    setSortKey(k);
    setSortOpen(false);
    setPage(1); 
  };

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

        {/* 커스텀 드롭다운 (전체/게시글/스터디 스타일) */}
        <div className="searchHeaderRight">
          <div className="dd" ref={sortRef}>
            <button
              type="button"
              className={`ddBtn ${sortOpen ? "open" : ""}`}
              onClick={() => setSortOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
            >
              <span className="ddBtnLabel">{sortLabel[sortKey]}</span>
              <span className="ddArrow" aria-hidden="true">
                ▾
              </span>
            </button>

            {sortOpen && (
              <div className="ddMenu" role="listbox" aria-label="스터디 정렬">
                <button
                  type="button"
                  className={`ddItem ${sortKey === "popular" ? "active" : ""}`}
                  onClick={() => chooseSort("popular")}
                  role="option"
                  aria-selected={sortKey === "popular"}
                >
                  <span className="ddItemText">인기순</span>
                </button>

                <button
                  type="button"
                  className={`ddItem ${sortKey === "latest" ? "active" : ""}`}
                  onClick={() => chooseSort("latest")}
                  role="option"
                  aria-selected={sortKey === "latest"}
                >
                  <span className="ddItemText">최신순</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && <div className="searchState">불러오는 중…</div>}
      {!loading && errorMsg && <div className="searchState error">{errorMsg}</div>}
      {!loading && !errorMsg && sortedItems.length === 0 && (
        <div className="searchState empty">검색 결과가 없어요.</div>
      )}

      {!loading && !errorMsg && sortedItems.length > 0 && (
        <div className="searchStudyWrap">
          {sortedItems.map((s) => (
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
                style={{ backgroundImage: `url(${s.coverImage ?? noImg})` }}
              >
                <div className="searchStudyChips">
                  <span className={`searchStudyChip ${s.isPublic ? "pub" : "pri"}`}>
                    {s.isPublic ? "공개" : "비공개"}
                  </span>
                  <span className="searchStudyChip ghost">{s.categoryLabel ?? "기타"}</span>
                </div>

                <div className="searchStudyTitleBar">
                  <div className="searchStudyName">{s.studyName}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <button onClick={() => setPage(p => p+1)}>다음</button>
    </section>
  );
}