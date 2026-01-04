import api from "../client";

/* 파일 요약 */
export const summarizeFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/api/ai-summary", formData, {
    headers: {
      // axios는 multipart일 때 Content-Type 명시 X
      // 브라우저가 boundary 자동 설정
    },
  });
};

/* URL 요약 */
export const summarizeUrl = (url: string) => {
  return api.post("/api/ai-summary", {
    sourceUrl: url,
    language: "ko",
    style: "brief",
    bullet: true,
    maxTokens: 800,
  });
};

/* 비동기 job 폴링 */
export const getSummaryJob = (jobId: string) => {
  return api.get(`/api/ai-summary/${jobId}`);
};
