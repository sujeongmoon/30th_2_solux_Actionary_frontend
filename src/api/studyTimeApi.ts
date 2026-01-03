import { api } from './client';

export interface DailyStudyTime {
  date: string;           // yyyy-mm-dd
  durationSeconds: number;
}

export const getMonthlyStudyTime = async (yearMonth: string): Promise<DailyStudyTime[]> => {
  // yearMonth 예: "2025-10"
  const res = await api.get('/api/studytimes', {
    params: {
      period: 'MONTH',
      date: yearMonth
    },
  });

  return res.data.data.montlyDurationSeconds;
};
