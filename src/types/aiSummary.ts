export type SummaryStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED';

export type SourceType = 'FILE' | 'URL';

export interface SummaryListItem {
  jobId: string;
  status: SummaryStatus;
  sourceType: SourceType;
  title: string;
  fileName: string | null;
  sourceUrl: string | null;
  createdAt: string;
  finishedAt: string | null;
  language: string;
  hasFullSummary: boolean;
}

export interface SummaryListResponse {
  success: boolean;
  message: string;
  data: {
    content: SummaryListItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface FileSummaryResponse {
  success: boolean;
  message: string;
  data: {
    status: SummaryStatus;
    summary: string | null;
    jobId: string | null;
    queuedAt: string | null;
    error: string | null;
  };
}
