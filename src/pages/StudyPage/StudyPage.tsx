import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudyPage.css";

import StudyViewModal from "../StudyDetailPage/StudyViewModal";
import { useAuth } from "../../context/AuthContext";
import StudyGuestView from "./StudyGuestView";
import StudyLoggedInView from "./StudyLoggedInView";

// ===== 타입/옵션 =====
type VisibilityParam = "public" | "private";

type CategoryEnum =
  | "CSAT"
  | "CIVIL_SERVICE"
  | "TEACHER_EXAM"
  | "LICENSE"
  | "LANGUAGE"
  | "EMPLOYMENT"
  | "OTHER";

const CATEGORY_OPTIONS: { label: string; value?: CategoryEnum }[] = [
  { label: "전체", value: undefined },
  { label: "수능", value: "CSAT" },
  { label: "공무원", value: "CIVIL_SERVICE" },
  { label: "임용", value: "TEACHER_EXAM" },
  { label: "자격증", value: "LICENSE" },
  { label: "어학", value: "LANGUAGE" },
  { label: "취업", value: "EMPLOYMENT" },
  { label: "기타", value: "OTHER" },
];

// “나만의 스터디” 상단 필터 (아래 필터랑 완전 별개)
type MyFilter = "ALL" | "CREATED" | "JOINED" | "FAVORITE";

export type StudyListItem = {
  studyId: number;
  studyName: string;
  coverImage?: string | null;
  isPublic: boolean;

  // 아래 필터용(카테고리)
  category?: CategoryEnum;

  // 위 “나만의 스터디” 필터용
  myType?: MyFilter;
};

function buildPageNumbers(current: number, totalPages: number, maxButtons = 5) {
  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(totalPages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
}

const USE_MOCK = true;

const MOCK_ITEMS: StudyListItem[] = [
  { studyId: 1, studyName: "같이 공부해요", coverImage: "https://picsum.photos/seed1/600/600", isPublic: true, category: "OTHER" },
  { studyId: 2, studyName: "공무원 한국사", coverImage: "https://picsum.photos/seed/study2/600/600", isPublic: true, category: "CIVIL_SERVICE" },
  { studyId: 3, studyName: "토익 900+", coverImage: "https://picsum.photos/seed/study3/600/600", isPublic: true, category: "LANGUAGE" },
  { studyId: 4, studyName: "자격증 스터디", coverImage: null, isPublic: true, category: "LICENSE" },
  { studyId: 5, studyName: "임용 오전반", coverImage: "https://picsum.photos/seed/study5/600/600", isPublic: false, category: "TEACHER_EXAM" },
  { studyId: 6, studyName: "취업 코테", coverImage: "https://picsum.photos/seed/study6/600/600", isPublic: false, category: "EMPLOYMENT" },
  { studyId: 7, studyName: "수능 국어", coverImage: null, isPublic: false, category: "CSAT" },
  { studyId: 8, studyName: "기타 모임", coverImage: "https://picsum.photos/seed/study8/600/600", isPublic: false, category: "OTHER" },
];

//  위 “나만의 스터디” 목업 -> 나만의 스터디 공란 원할 시 해당 목업 전체 삭제 후 테스트
const MOCK_MY_STUDIES: StudyListItem[] = [
  { studyId: 101, studyName: "내 스터디 A", coverImage: null, isPublic: true, myType: "CREATED" },
  { studyId: 102, studyName: "내 스터디 B", coverImage: null, isPublic: true, myType: "JOINED" },
  { studyId: 103, studyName: "내 스터디 C", coverImage: null, isPublic: true, myType: "FAVORITE" },
  { studyId: 104, studyName: "내 스터디 D", coverImage: null, isPublic: true, myType: "CREATED" },
];

export default function StudyPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [visibility, setVisibility] = useState<VisibilityParam>("public");
  const [categoryLabel, setCategoryLabel] = useState<string>("전체");
  const [category, setCategory] = useState<CategoryEnum | undefined>(undefined);

  const [myFilter, setMyFilter] = useState<MyFilter>("ALL");

  // 모달
  const [selectedStudyId, setSelectedStudyId] = useState<number | null>(null);

  const [page, setPage] = useState(1);

  const [items, setItems] = useState<StudyListItem[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [size, setSize] = useState<number>(8);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pageNumbers = useMemo(() => buildPageNumbers(page, totalPages, 5), [page, totalPages]);

  const onChangeVisibility = (v: VisibilityParam) => {
    setVisibility(v);
    setPage(1);
  };

  const onChangeCategory = (label: string, value?: CategoryEnum) => {
    setCategoryLabel(label);
    setCategory(value);
    setPage(1);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErrorMsg(null);

    if (USE_MOCK) {
      // 1) 공개/비공개
      let filtered = MOCK_ITEMS.filter((item) => (visibility === "public" ? item.isPublic : !item.isPublic));

      // 2) 카테고리(전체면 패스)
      if (category) {
        filtered = filtered.filter((item) => item.category === category);
      }

      const fakeSize = 8;
      const fakeTotalElements = filtered.length;
      const fakeTotalPages = Math.max(1, Math.ceil(fakeTotalElements / fakeSize));
      const start = (page - 1) * fakeSize;

      if (!mounted) return;

      setItems(filtered.slice(start, start + fakeSize));
      setTotalElements(fakeTotalElements);
      setTotalPages(fakeTotalPages);
      setSize(fakeSize);
      setLoading(false);
      return;
    }

    // TODO: API 연동 시 getStudies 호출
    setLoading(false);

    return () => {
      mounted = false;
    };
  }, [visibility, category, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const filteredMyStudies = useMemo(() => {
    const base = MOCK_MY_STUDIES;
    if (myFilter === "ALL") return base;
    return base.filter((s) => s.myType === myFilter);
  }, [myFilter]);

  // 공통 props
  const commonProps = {
    navigate,

    // 아래 필터
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

    onOpenStudy: (id: number) => setSelectedStudyId(id),

    // 위 “나만의 스터디”
    myStudies: filteredMyStudies,
    myFilter,
    setMyFilter,
  };

  return (
    <div className="studyPage">
      {isLoggedIn ? <StudyLoggedInView {...commonProps} /> : <StudyGuestView {...commonProps} />}

      {/* 모달 */}
      {selectedStudyId !== null && (
        <StudyViewModal open={selectedStudyId !== null} onClose={() => setSelectedStudyId(null)} studyId={selectedStudyId} />
      )}
    </div>
  );
}