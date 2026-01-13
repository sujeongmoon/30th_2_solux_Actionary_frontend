// 인기 스터디 불러오기
export interface StudyPopularListItem {
  studyId: number;
  studyName: string;
  coverImage?: string;
  description?: string;
  memberNow: string;
}

export interface GetPopularStudiesResponse {
  success: boolean;
  message: string;
  data: {
    content: StudyPopularListItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}
