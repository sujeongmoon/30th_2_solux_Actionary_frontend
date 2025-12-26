export type Visibility = "public" | "private";

export type StudySummary = {
  studyId: number;
  title: string;
  category?: string;
  visibility?: Visibility;
  thumbnailUrl?: string;
};

export type StudyListResponse = {
  studies: StudySummary[];
  totalCount?: number;
};