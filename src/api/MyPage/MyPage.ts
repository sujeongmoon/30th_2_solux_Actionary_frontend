import { type GetTodoCategoriesResponse, type GetStudyTimeResponse, type GetTodosByDateResponse, type TabKey, type TodoUpdateStatus } from '../../types/MyPageTypes';
import { api } from '../client';


export const getTodoListByDate = async (
  date: string
) => {
  const res = await api.get<GetTodosByDateResponse>('/api/todos', {
    params: { date },
  });
  return res.data.data; // { date, todos }
};

export const updateTodoStatus = async (
    todoId: number,
    status: TodoUpdateStatus
) => {
    const res = await api.patch(`/api/todos/${todoId}/status`, {
        status,
    });
    return res.data.data;
};

export const getTodoCategories = async() => {
    const res = await api.get<GetTodoCategoriesResponse>('/api/todo-categories');
    return res.data.data;
}

export const getStudyTime = async (
  period: TabKey,
  date: string
) => {
  const res = await api.get<GetStudyTimeResponse>('/api/study-times', {
    params: {
      period,
      date,
    },
  });

  return res.data.data; 

};