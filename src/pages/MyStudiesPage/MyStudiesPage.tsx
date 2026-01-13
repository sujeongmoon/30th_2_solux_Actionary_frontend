import { useMemo, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./MyStudiesPage.css";
import StudyViewModal, { type StudyViewData } from "../StudyDetailPage/StudyViewModal";

type MyScope = "ALL" | "OWNER" | "PARTICIPATING" | "FAVORITE"; // 전체 / 개설 / 참여 / 즐겨찾기
type VisibilityFilter = "ALL" | "PUBLIC" | "PRIVATE";

type StudyCard = {
  studyId: number;
  studyName: string;
  coverImage?: string | null;
  categoryLabel?: string; // "공무원" 같은 한글 라벨
  isPublic?: boolean; // 공개/비공개
  isFavorite?: boolean;
  isOwner?: boolean;
  isParticipating?: boolean;
};

// ===== mock =====
const MOCK: StudyCard[] = [
  {
    studyId: 1,
    studyName: "같이 공부해요",
    coverImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200",
    categoryLabel: "기타",
    isPublic: true,
    isFavorite: false,
    isOwner: true,
    isParticipating: true,
  },
  {
    studyId: 2,
    studyName: "공무원 한국사",
    coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200",
    categoryLabel: "공무원",
    isPublic: true,
    isFavorite: true,
    isOwner: true,
    isParticipating: true,
  },
  {
    studyId: 3,
    studyName: "임용 준비반",
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200",
    categoryLabel: "임용",
    isPublic: false,
    isFavorite: false,
    isOwner: true,
    isParticipating: false,
  },
  {
    studyId: 11,
    studyName: "자격증 스터디",
    coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200",
    categoryLabel: "자격증",
    isPublic: true,
    isFavorite: false,
    isOwner: false,
    isParticipating: true,
  },
  {
    studyId: 12,
    studyName: "어학 스피킹",
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200",
    categoryLabel: "어학",
    isPublic: true,
    isFavorite: true,
    isOwner: false,
    isParticipating: true,
  },
  {
    studyId: 13,
    studyName: "토익 900+",
    coverImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200",
    categoryLabel: "어학",
    isPublic: true,
    isFavorite: false,
    isOwner: false,
    isParticipating: false,
  },
  {
    studyId: 14,
    studyName: "자격증 스터디",
    coverImage: null,
    categoryLabel: "자격증",
    isPublic: true,
    isFavorite: false,
    isOwner: false,
    isParticipating: false,
  },
];

const PAGE_SIZE = 8;

function toModalData(s: StudyCard): StudyViewData {
  // 요구사항 반영(안내는 공백 가능 / 커버 없으면 모달에서 로고로 대체)
  const limit = 15;
  const live = Math.min(limit, Math.max(0, (s.studyId * 3) % (limit + 1))); // 임시

  return {
    studyId: s.studyId,
    studyName: s.studyName,
    coverImage: s.coverImage ?? null,
    categoryLabel: s.categoryLabel ?? "기타",
    isPublic: !!s.isPublic,

    liked: !!s.isFavorite,
    canManage: !!s.isOwner, // 내가 만든 것만 ⋮ 활성화

    description: "설명설명설명설명설명설명설명설명설명",
    guide: "", // 안내는 공백 가능

    liveCount: live,
    memberLimit: limit,

    ranking: [
      { rank: 1, nickname: "눈송이", daily: "2시간 10분", total: "12시간 05분" },
      { rank: 2, nickname: "눈송이", daily: "1시간 20분", total: "10시간 40분" },
      { rank: 3, nickname: "눈송이", daily: null, total: "9시간 15분" },
      { rank: 4, nickname: "눈송이", daily: "0시간 50분", total: "8시간 03분" },
      { rank: 5, nickname: "눈송이", daily: null, total: "7시간 20분" },
      { rank: 6, nickname: "눈송이", daily: "0시간 10분", total: "6시간 59분" },
    ],
  };
}

export default function MyStudiesPage() {
  const navigate = useNavigate();

  // 상단(나만의 스터디) 필터: 전체/개설/참여/즐겨찾기
  const [scope, setScope] = useState<MyScope>("ALL");

  // 아래(전체 카드) 공개/비공개 탭
  const [visibility, setVisibility] = useState<VisibilityFilter>("ALL");

  // 캐러셀 인덱스
  const [carouselIndex, setCarouselIndex] = useState(0);

  // 페이지네이션
  const [page, setPage] = useState(1);

  // 모달 선택 상태(이것만 있으면 됨)
  const [selected, setSelected] = useState<StudyViewData | null>(null);

  // ===== 상단 "나만의 스터디" 후보 리스트 (scope에 따라) =====
  const myList = useMemo(() => {
    const base = MOCK.filter((s) => s.isOwner || s.isParticipating || s.isFavorite);
    if (scope === "ALL") return base;
    if (scope === "OWNER") return base.filter((s) => s.isOwner);
    if (scope === "PARTICIPATING") return base.filter((s) => s.isParticipating);
    return base.filter((s) => s.isFavorite);
  }, [scope]);

  // 캐러셀은 3장씩
  const carouselPageSize = 3;
  const carouselMaxIndex = Math.max(0, Math.ceil(myList.length / carouselPageSize) - 1);
  const carouselSlice = useMemo(() => {
    const start = carouselIndex * carouselPageSize;
    return myList.slice(start, start + carouselPageSize);
  }, [myList, carouselIndex]);

  // ===== 아래 그리드 =====
  const gridList = useMemo(() => {
    let result = [...MOCK];
    if (visibility === "PUBLIC") result = result.filter((s) => s.isPublic);
    if (visibility === "PRIVATE") result = result.filter((s) => !s.isPublic);
    return result;
  }, [visibility]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(gridList.length / PAGE_SIZE)), [gridList.length]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return gridList.slice(start, start + PAGE_SIZE);
  }, [gridList, page]);

  // 필터 바뀌면 page 리셋
  const onChangeVisibility = (v: VisibilityFilter) => {
    setVisibility(v);
    setPage(1);
  };

  const onChangeScope = (s: MyScope) => {
    setScope(s);
    setCarouselIndex(0);
  };

  // 카드 클릭 공통: 모달 열기
  const openModal = (e: MouseEvent<HTMLElement>, s: StudyCard) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(toModalData(s));
  };

  return (
    <div className="myWrap">
      {/* ===== 상단: 나만의 스터디 영역 ===== */}
      <section className="myHero">
        <div className="myHeroTop">
          <div className="myHeroTitle">나만의 스터디</div>

          <div className="myHeroFilters">
            <button className={`check ${scope === "ALL" ? "on" : ""}`} onClick={() => onChangeScope("ALL")} type="button">
              전체
            </button>
            <button className={`check ${scope === "OWNER" ? "on" : ""}`} onClick={() => onChangeScope("OWNER")} type="button">
              개설한 스터디
            </button>
            <button
              className={`check ${scope === "PARTICIPATING" ? "on" : ""}`}
              onClick={() => onChangeScope("PARTICIPATING")}
              type="button"
            >
              참여한 스터디
            </button>
            <button className={`check ${scope === "FAVORITE" ? "on" : ""}`} onClick={() => onChangeScope("FAVORITE")} type="button">
              즐겨찾기
            </button>
          </div>
        </div>

        <div className="carousel">
          <button
            type="button"
            className="arrow left"
            onClick={() => setCarouselIndex((i) => Math.max(0, i - 1))}
            disabled={carouselIndex <= 0}
            aria-label="prev"
          >
            ‹
          </button>

          <div className="carouselTrack">
          {carouselSlice.length === 0 ? (
  <div
    className="myStudyEmptyCta"
    role="button"
    tabIndex={0}
    onClick={() => navigate("/studies/new")}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") navigate("/studies/new");
    }}
  >
    <button className="myStudyEmptyPlus" type="button" aria-label="스터디 만들기">
      +
    </button>
    <div className="myStudyEmptyText">
      <span className="myStudyEmptyIcon">🏃🏻‍♀️</span>
      <span>지금 로그인하고, 나만의 스터디를 만들어보세요 !</span>
    </div>
  </div>
) : (
  <div className="carouselRow">
    {carouselSlice.map((s) => (
      <article
        key={s.studyId}
        className="miniCard"
        role="button"
        tabIndex={0}
        onClick={(e) => openModal(e, s)}
      >
        <div className="miniThumb">
          {s.coverImage ? <img src={s.coverImage} alt="" /> : <div className="miniFallback" />}
        </div>
        <div className="miniLabel">{s.studyName}</div>
      </article>
    ))}
  </div>
)}
          </div>

          <button
            type="button"
            className="arrow right"
            onClick={() => setCarouselIndex((i) => Math.min(carouselMaxIndex, i + 1))}
            disabled={carouselIndex >= carouselMaxIndex}
            aria-label="next"
          >
            ›
          </button>
        </div>
      </section>

      {/* ===== 아래: 그리드 ===== */}
      <section className="myGridArea">
        <div className="gridTop">
          <div className="visTabs">
            <button type="button" className={`visTab ${visibility === "PUBLIC" ? "on" : ""}`} onClick={() => onChangeVisibility("PUBLIC")}>
              공개
            </button>
            <span className="visBar">|</span>
            <button type="button" className={`visTab ${visibility === "PRIVATE" ? "on" : ""}`} onClick={() => onChangeVisibility("PRIVATE")}>
              비공개
            </button>
          </div>

          <div className="gridMeta">
            <div className="totalText">총 {gridList.length}개 스터디</div>
            <div className="catLine">
              <span className="catOn">전체</span>
              <span>· 수능</span>
              <span>· 공무원</span>
              <span>· 임용</span>
              <span>· 자격증</span>
              <span>· 어학</span>
              <span>· 취업</span>
              <span>· 기타</span>
            </div>
          </div>
        </div>

        <div className="cardGrid">
          {paged.map((s) => (
            <article
              key={s.studyId}
              className="gridCard"
              role="button"
              tabIndex={0}
              onClick={(e) => openModal(e, s)} 
            >
              <div className="gridThumb">
                {s.coverImage ? <img src={s.coverImage} alt="" /> : <div className="gridFallback" />}
              </div>
              <div className="gridTitlePill">{s.studyName}</div>
            </article>
          ))}
        </div>

        <div className="pagerRow">
          <button className="pgBtn" type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            ‹
          </button>

          <div className="pgNums">
            {Array.from({ length: totalPages }).slice(0, 5).map((_, idx) => {
              const p = idx + 1;
              return (
                <button key={p} className={`pgNum ${p === page ? "on" : ""}`} type="button" onClick={() => setPage(p)}>
                  {p}
                </button>
              );
            })}
          </div>

          <button className="pgBtn" type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            ›
          </button>
        </div>
      </section>

      {/* 모달(항상 return 안에 존재해야 뜸) */}
      <StudyViewModal
        open={!!selected}
        data={
          selected ?? {
            studyId: 0,
            studyName: "",
            ranking: [], // map 터짐 방지
          }
        }
        onClose={() => setSelected(null)}
        enterPath={`/study-room/${selected?.studyId ?? 0}`} // 임의 경로 가정
        onEdit={(id) => {
          navigate(`/studies/${id}/edit`); // 임의 경로 가정
        }}
        onDelete={(id) => {
          const ok = window.confirm(`스터디(${id})를 삭제할까요? (현재는 UI 단계)`);
          if (ok) setSelected(null);
        }}
      />
    </div>
  );
}