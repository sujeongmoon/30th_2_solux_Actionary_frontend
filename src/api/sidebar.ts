import { api } from './client';

export const getMyInfo = async () => {
    const res = await api.get('/members/me/info');
    return res.data.data;
}

export const getUserPoints = async () => {
    const res = await api.get('/users/me/points');
    return res.data.data;
}

// 오늘 공부량
export const getStudyTimeByDate = async (date: string) => {
  const res = await api.get(`/studytimes`, {
    params: { 
        period: 'day',
        date
     } 
  });
  return res.data.data; // { studyTime: "22H 30M" }
};

// 오늘 TO DO 리스트
export const getTodoListByDate = async (date: string) => {
  const res = await api.get(`/todos`, {
    params: { date } // ?date=2026-01-04
  });
  return res.data.data; // [{ id, category, task, status }, ...]
};
