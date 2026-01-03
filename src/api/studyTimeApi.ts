import { api } from './client';

export interface DailyStudyTimeResponse {
  date: string;           // yyyy-mm-dd
  durationSeconds: number;
}

export const getDailyStudyTime = async (date: string): Promise<number> => {
  const res = await api.get('/api/studytimes', {
    params: {
      period: 'DAY',
      date,
    },
  });

  return res.data.data;
};
