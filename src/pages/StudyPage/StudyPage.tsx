import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudyPage.css";

import StudyViewModal from "../StudyDetailPage/StudyViewModal";
import { useAuth } from "../../context/AuthContext";
import StudyGuestView from "./StudyGuestView";
import StudyLoggedInView from "./StudyLoggedInView";
import { getStudies, getMyStudies } from "../../api/studies";

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

// “나만의 스터디” 상단 필터
export type MyScope = "ALL" | "OWNED" | "JOINED" | "LIKED";

export type StudyListItem = {
  studyId: number;
  studyName: string;
  coverImage?: string | null;
  isPublic: boolean;
  category?: CategoryEnum;
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

function mapStudyItem(raw: any): StudyListItem {
  return {
    studyId: Number(raw?.studyId ?? raw?.id ?? 0),
    studyName: String(raw?.studyName ?? raw?.name ?? ""),
    coverImage: (raw?.coverImage ?? raw?.coverImageUrl ?? raw?.image ?? null) as string | null,
    isPublic: Boolean(raw?.isPublic ?? raw?.public ?? raw?.visibility === "PUBLIC"),
    category: (raw?.category ?? raw?.studyCategory ?? raw?.categoryEnum ?? undefined) as
      | CategoryEnum
      | undefined,
  };
}

function extractPaged(raw: any) {
  const itemsRaw = raw?.items ?? raw?.content ?? raw?.studies ?? raw?.list ?? raw?.data ?? [];
  const items = Array.isArray(itemsRaw) ? itemsRaw.map(mapStudyItem) : [];

  const totalElements = Number(raw?.totalElements ?? raw?.totalCount ?? raw?.total ?? items.length) || 0;

  const size = Number(raw?.size ?? raw?.pageSize ?? 8) || 8;

  const totalPages =
    Number(raw?.totalPages ?? raw?.pageCount ?? Math.max(1, Math.ceil(totalElements / size))) || 1;

  return { items, totalElements, totalPages, size };
}

function extractMyList(raw: any): StudyListItem[] {
  const itemsRaw = raw?.items ?? raw?.content ?? raw?.studies ?? raw?.list ?? raw?.data ?? [];
  return Array.isArray(itemsRaw) ? itemsRaw.map(mapStudyItem) : [];
}

export default function StudyPage() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  // ===== 전체 스터디 필터/페이지 =====
  const [visibility, setVisibility] = useState<VisibilityParam>("public");
  const [categoryLabel, setCategoryLabel] = useState<string>("전체");
  const [category, setCategory] = useState<CategoryEnum | undefined>(undefined);

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<StudyListItem[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [size, setSize] = useState<number>(8);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ===== 나만의 스터디(백 페이지네이션) =====
  const [myFilter, setMyFilter] = useState<MyScope>("ALL");
  const [myPage, setMyPage] = useState(1); // UI 1부터
  const [myTotalPages, setMyTotalPages] = useState(1);
  const [myStudies, setMyStudies] = useState<StudyListItem[]>([]);

  // ===== 모달 =====
  const [selectedStudyId, setSelectedStudyId] = useState<number | null>(null);

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

  // myFilter 바뀌면 “나만의 스터디”도 1페이지로 리셋
  useEffect(() => {
    setMyPage(1);
  }, [myFilter]);

  // ===== 전체 스터디 목록 =====
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErrorMsg(null);

    (async () => {
      try {
        const data = await getStudies({
          visibility,
          category,
          page,
          size: 8,
        });

        const { items, totalElements, totalPages, size } = extractPaged(data);

        if (!mounted) return;
        setItems(items);
        setTotalElements(totalElements);
        setTotalPages(totalPages);
        setSize(size);
      } catch (e: any) {
        if (!mounted) return;
        const status = e?.response?.status;
        if (status === 401) setErrorMsg("로그인이 필요해요.");
        else setErrorMsg(e?.response?.data?.message ?? "스터디 목록을 불러오지 못했어요.");

        setItems([]);
        setTotalElements(0);
        setTotalPages(1);
        setSize(8);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [visibility, category, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  // ===== 나만의 스터디 목록 (페이지네이션 적용) =====
  useEffect(() => {
    let mounted = true;

    if (!isLoggedIn) {
      setMyStudies([]);
      setMyTotalPages(1);
      return;
    }

    (async () => {
      try {
        const data = await getMyStudies({
          scope: myFilter,
          page: myPage, 
          size: 3, 
        });

        const list = extractMyList(data);
        if (!mounted) return;

        setMyStudies(list);
        setMyTotalPages(Number(data?.totalPages ?? 1) || 1);
      } catch {
        if (!mounted) return;
        setMyStudies([]);
        setMyTotalPages(1);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn, myFilter, myPage]);

  const commonProps = {
    navigate,
    nickname: user?.nickname ?? "",

    // 아래 필터(전체 스터디)
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
    myStudies,
    myFilter,
    setMyFilter,

    // 나만의 스터디 페이지네이션
    myPage,
    setMyPage,
    myTotalPages,
  };

  return (
    <div className="studyPage">
      {isLoggedIn ? <StudyLoggedInView {...commonProps} /> : <StudyGuestView {...commonProps} />}
  
      {selectedStudyId !== null && (
        <StudyViewModal
          open={true}
          studyId={selectedStudyId}
          onClose={() => setSelectedStudyId(null)}
          onDeleted={(deletedId) => {
            navigate(0);
          }}
        />
      )}
    </div>
  );
}