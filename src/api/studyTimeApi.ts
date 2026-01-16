import { api } from './client';

export interface DailyStudyTime {
  date: string;           // yyyy-mm-dd
  durationSeconds: number;
}

export const getMonthlyStudyTime = async (yearMonth: string): Promise<DailyStudyTime[]> => {

  const res = await api.get('/studytimes/calender', {
    params: {
      date: yearMonth
    },
  });

  return res.data.data.monthlyDurationSeconds;
};
