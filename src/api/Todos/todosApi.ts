import { api } from '../client';


// 특정 날짜 투두리스트 조회
export const getTodosByDate = async (date: string) => {
    try {
        const res = await api. get(`/todos`, {
            params: {date},
        });
        return res.data;
    } catch (error) {
        console.error('투두리스트 조회 실패', error);
        throw error;
    }
};

// 투두리스트 달성, 실패
export type TodoStatus = 'PENDING' | 'DONE' | 'FAILED';

export const updateTodoStatus = async (
    todoId: number,
    status: TodoStatus
) => {
    const res = await api.patch(`/api/todos/${todoId}/status`, {
        status,
    });
    return res.data;
}