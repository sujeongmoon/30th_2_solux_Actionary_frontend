// api/study/getPopularStudies.ts// api/study/getPopularStudies.ts
import type { StudyPopularListItem } from '../../types/HomePageTypes';
import { api } from '../client';

export const getPopularStudies = async (page = 0): Promise<{
  studies: StudyPopularListItem[];
  totalPages: number;
}> => {
  const res = await api.get("/studies/hit", { params: { page } });
  return {
    studies: res.data.data.content, // content 배열
    totalPages: res.data.data.totalPages // 총 페이지 수
  };
};
