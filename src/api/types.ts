export type StudyCategory =
  | "CSAT"
  | "CIVIL_SERVICE"
  | "TEACHER_EXAM"
  | "LICENSE"
  | "LANGUAGE"
  | "EMPLOYMENT"
  | "OTHER";

export type StudyVisibility = "public" | "private";

export type StudyListItem = {
  studyId: number;
  studyName: string;
  coverImage: string;
};

export type StudyListResponse = {
  isPublic: boolean;
  category: StudyCategory | null;
  categoryLabel: string | null;
  content: StudyListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type MyStudyScope = "ALL" | "OWNED" | "JOINED" | "LIKED";

export type MyStudyListItem = {
  studyId: number;
  studyName: string;
  coverImage: string;
  description: string;
  memberNow: number;
};

export type MyStudyListResponse = {
  scope: MyStudyScope;
  scopeLabel: string;
  content: MyStudyListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type StudyDetail = {
  studyId: number;
  studyName: string;
  coverImage: string;
  category: StudyCategory;
  categoryLabel: string;
  description: string;
  memberNow: number;
  memberLimit: number;
  isPublic: boolean;
  isStudyLike: boolean;
  isStudyOwner: boolean;
};

export type RankingRow = {
  userId: number;
  userNickname: string;
  todayDurationSeconds: number;
  totalDurationSeconds: number;
};

export type RankingsResponse = {
  studyId: number;
  isToday: boolean;
  rankingBoards: RankingRow[];
};

export type SearchStudyItem = {
  studyId: number;
  title: string;
};

export type Paginated<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type StudyEnterResponse = {
  studyParticipantId: number;
  studyId: number;
  isActive: boolean;
  userId: number;
};