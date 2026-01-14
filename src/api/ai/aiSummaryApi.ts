import { api } from '../client';
import { type SummaryListResponse } from '../../types/aiSummary';
/* ================= 타입 ================= */

export type SummaryStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED';

export interface SummaryJobBase {
  jobId: string;
  status: SummaryStatus;
}

export interface SummaryJobPending extends SummaryJobBase {
  status: 'PENDING' | 'PROCESSING';
  queuedAt: string;
}

export interface SummaryJobSuccess extends SummaryJobBase {
  status: 'SUCCEEDED';
  summary: string;
}

export interface SummaryJobFailed extends SummaryJobBase {
  status: 'FAILED';
  error: string | null | {
    code?: string;
    message?: string;
  };
}

export type SummaryJobData =
  | SummaryJobPending
  | SummaryJobSuccess
  | SummaryJobFailed;

export interface SummaryJobResponse {
  success: boolean;
  message: string;
  data: SummaryJobData;
}

/* ================= API ================= */

// 파일 요약
export const summarizeFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post<SummaryJobResponse>('/ai-summary/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// URL 요약
export const summarizeUrl = (sourceUrl: string, options?: { language?: string; maxTokens?: number }) => {
  return api.post<SummaryJobResponse>('/ai-summary/url', {
    sourceUrl,
    language: options?.language,
    maxTokens: options?.maxTokens ?? 600,
  });
};

// 폴링
export const getSummaryJob = (jobId: string) => {
  return api.get<SummaryJobResponse>(`/ai-summary/${jobId}`);
};

// 목록 조회
export const getSummaryList = (page = 1, size = 10) => {
  return api.get<SummaryListResponse>('/ai-summary', {
    params: { page, size }
  })
}

