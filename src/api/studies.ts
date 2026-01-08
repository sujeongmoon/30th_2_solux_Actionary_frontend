import { api } from "./client";
import type {
  MyStudyScope,
  StudyCategory,
  StudyDetail,
  StudyEnterResponse,
  StudyListResponse,
  StudyVisibility,
  MyStudyListResponse,
  RankingsResponse,
  Paginated,
  SearchStudyItem,
} from "./types";

export async function getStudyList(params: {
  visibility?: StudyVisibility; // public/private
  category?: StudyCategory;
  page?: number; 
  size?: number; 
}) {
  const { visibility = "public", category, page = 1, size = 8 } = params;

  const apiPage = Math.max(0, page - 1);

  const res = await api.get<ApiEnvelope<StudyListResponse>>("/api/studies", {
    params: {
      visibility,
      category,
      page: apiPage,
      size,
    },
  });
  return res.data.data;
}

export async function getMyStudies(params: {
  scope?: MyStudyScope;
  page?: number; // UI 1부터
  size?: number; // 문서 기본 3
}) {
  const { scope = "ALL", page = 1, size = 3 } = params;
  const apiPage = Math.max(0, page - 1);

  const res = await api.get<ApiEnvelope<MyStudyListResponse>>("/api/studies/my", {
    params: { scope, page: apiPage, size },
  });
  return res.data.data;
}


export async function searchStudies(params: {
  q: string;
  sort?: "RECENT" | "POPULAR";
  page?: number; // 문서 기본 1이라 그대로 사용
  size?: number; // 문서 기본 10
}) {
  const { q, sort = "RECENT", page = 1, size = 10 } = params;

  const res = await api.get<ApiEnvelope<Paginated<SearchStudyItem>>>(
    "/api/search/studies",
    { params: { q, sort, page, size } }
  );

  return res.data.data;
}

export async function getStudyDetail(studyId: number) {
  const res = await api.get<ApiEnvelope<StudyDetail>>(`/api/studies/${studyId}`);
  return res.data.data;
}


export async function toggleStudyLike(studyId: number) {
  const res = await api.post<ApiEnvelope<any>>(`/api/studies/${studyId}/likes`);
  return res.data.data;
}

export async function deleteStudy(studyId: number) {
  const res = await api.delete<ApiEnvelope<null>>(`/api/studies/${studyId}`);
  return res.data.data;
}


export async function getStudyRankings(studyId: number, type: "today" | "total" = "today") {
  const res = await api.get<ApiEnvelope<RankingsResponse>>(
    `/api/studies/${studyId}/rankings`,
    { params: { type } }
  );
  return res.data.data;
}


export async function enterPublicStudy(studyId: number) {
  const res = await api.post<ApiEnvelope<StudyEnterResponse>>(
    `/api/studies/${studyId}/participating/public`
  );
  return res.data.data;
}


export async function enterPrivateStudy(studyId: number, password: string | number) {
  const res = await api.post<ApiEnvelope<StudyEnterResponse>>(
    `/api/studies/${studyId}/participating/private`,
    { password }
  );
  return res.data.data;
}

export async function exitStudy(studyId: number, type: "STUDY" | "BREAK") {
  const res = await api.patch<ApiEnvelope<null>>(`/api/studies/${studyId}/participating`, { type });
  return res.data.data;
}

export { getStudyList as getStudies };
export { getStudyList as getStudiesList };