// api/study/getPopularStudies.ts
import { api } from '../client';

export const getPopularStudies = async (page = 0) => {
  const res = await api.get("/studies/hit", {
    params: { page },
  });
  return res.data;
};
