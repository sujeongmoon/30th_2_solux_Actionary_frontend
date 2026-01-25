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
  ApiEnvelope,
} from "./types";

export async function getStudyList(params: {
  visibility?: StudyVisibility;
  category?: StudyCategory;
  page?: number; 
  size?: number;
}) {
  const { visibility = "public", category, page = 1, size = 8 } = params;
  const apiPage = Math.max(0, page - 1);

  const res = await api.get<ApiEnvelope<StudyListResponse>>("/studies", {
    params: { visibility, category, page: apiPage, size },
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

  const res = await api.get<ApiEnvelope<MyStudyListResponse>>("/studies/my", {
    params: { scope, page: apiPage, size },
  });
  return res.data.data;
}

export async function createStudy(
  payload: {
    studyName: string;
    description: string;
    longDescription?: string | null;
    category: StudyCategory;
    memberLimit: number;
    isPublic: boolean;
    password?: string | null;
  },
  coverFile?: File | null
) {
  const form = new FormData();

  form.append("studyInfo", new Blob([JSON.stringify(payload)], { type: "application/json" }));
  if (coverFile) form.append("coverImage", coverFile);

  const res = await api.post<ApiEnvelope<any>>(`/studies`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export async function searchStudies(params: {
  q: string;
  sort?: "RECENT" | "POPULAR";
  page?: number;
  size?: number;
}) {
  const { q, sort = "RECENT", page = 1, size = 10 } = params;

  const res = await api.get<ApiEnvelope<Paginated<SearchStudyItem>>>("/search/studies", {
    params: { q, sort, page, size },
  });

  return res.data.data;
}

export async function getStudyDetail(studyId: number) {
  const res = await api.get<ApiEnvelope<StudyDetail>>(`/studies/${studyId}`);
  return res.data.data;
}

export async function toggleStudyLike(studyId: number) {
  const res = await api.post<ApiEnvelope<any>>(`/studies/${studyId}/likes`);
  return res.data.data;
}

export async function deleteStudy(studyId: number) {
  const res = await api.delete<ApiEnvelope<null>>(`/studies/${studyId}`);
  return res.data.data;
}

export async function getStudyRankings(studyId: number, type: "today" | "total" = "today") {
  const res = await api.get<ApiEnvelope<RankingsResponse>>(`/studies/${studyId}/rankings`, {
    params: { type },
  });
  return res.data.data;
}

export async function enterPublicStudy(studyId: number) {
  const res = await api.post<ApiEnvelope<StudyEnterResponse>>(
    `/studies/${studyId}/participating/public`
  );
  return res.data.data;
}

export async function enterPrivateStudy(studyId: number, password: string | number) {
  const res = await api.post<ApiEnvelope<StudyEnterResponse>>(
    `/studies/${studyId}/participating/private`,
    { password }
  );
  return res.data.data;
}

export type NowState = "STUDY" | "BREAK";


type DurationTimeRes = {
  studyTimeId: number;
  studyParticipantId: number;
  studyId: number;
  userId: number;
  changedType: NowState;
  changedTypeLabel: string;
  totalStudySeconds: number;
  totalBreakSeconds: number;
};

export async function postDurationTime(studyId: number, type: NowState) {
  const res = await api.post<ApiEnvelope<DurationTimeRes>>(
    `/studies/${studyId}/participating/durationtime`,
    { type }
  );
  return res.data.data;
}
export async function exitStudy(studyId: number, type: "STUDY" | "BREAK") {
  const res = await api.patch(
    `/studies/${studyId}/participating`,
    { type }
  );
  return res.data;
}


export type UpdateStudyPayload = {
  studyName: string;
  category:
    | "CSAT"
    | "CIVIL_SERVICE"
    | "TEACHER_EXAM"
    | "LICENSE"
    | "LANGUAGE"
    | "EMPLOYMENT"
    | "OTHER";
  description: string;    // 20자 제한
  longDescription?: string | null;
  memberLimit: number;    // int
  isPublic: boolean;      // boolean
  password?: number;      // 비공개일 때만
};


export type UpdateStudyResponse = {
  studyId: number;
  name?: string;
  studyName?: string;
  coverImage?: string | null;
  category?: UpdateStudyPayload["category"];
  categoryLabel?: string;
  description?: string;
  memberLimit?: number;
  isPublic?: boolean;
};

export async function updateStudy(
  studyId: number,
  payload: UpdateStudyPayload,
  coverFile?: File | null
) {
  const form = new FormData();

  form.append(
    "studyInfo",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );

  if (coverFile) form.append("coverImage", coverFile);

  const res = await api.put(`/studies/${studyId}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
}

export async function updateNowState(studyId: number, nowState: string) {
  const res = await api.patch(`/studies/${studyId}/participating/nowState`, {
    nowState, 
  });
  return res.data;
}

export async function reissueJanusSession(studyId: number) {
  try {
    const res = await api.post<ApiEnvelope<any>>("/studies/janus", {
      studyId,
    });
    return res.data.success; 
  } catch (e) {
    console.error("Janus 세션 재발급 요청 실패:", e);
    return false;
  }
}


export { getStudyList as getStudies };
export { getStudyList as getStudiesList };