import { api } from '../client';

/* ================= 타입 ================= */

export type SummaryStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED';

export interface SummaryJobBase {
  jobId: string;
  status: SummaryStatus;
}

export interface SummaryJobPending extends SummaryJobBase {
  status: 'PENDING' | 'RUNNING';
  queuedAt: string;
  estimateSec: number;
}

export interface SummaryJobSuccess extends SummaryJobBase {
  status: 'SUCCEEDED';
  summary: string;
}

export interface SummaryJobFailed extends SummaryJobBase {
  status: 'FAILED';
  error: {
    code: string;
    message: string;
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

  return api.post('/api/ai-summary', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// URL 요약
export const summarizeUrl = (sourceUrl: string) => {
  return api.post('/api/ai-summary', {
    sourceUrl,
  });
};

// 폴링
export const getSummaryJob = (jobId: string) => {
  return api.get<SummaryJobResponse>(`/api/ai-summary/${jobId}`);
};
