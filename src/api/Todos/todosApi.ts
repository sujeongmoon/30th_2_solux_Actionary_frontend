import { api } from '../client';


// 특정 날짜 투두리스트 조회
export const getTodosByDate = async (date: string) => {
    try {
        const res = await api.get(`/api/todos`, {
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

// 투두 생성
export interface CreateTodoRequest {
    title: string;
    date: string;
    categoryId?: number | null;
}

export const createTodo = async ({
    title,
    date,
    categoryId = null,
}: CreateTodoRequest) => {
    try {
        const res = await api.post('/api/todos', {
            title,
            date,
            categoryId,
        });
        return res.data;
    } catch (error) {
        console.error('투두 생성 실패', error);
        throw error;
    }
};

// 투두 수정
export interface UpdateTodoRequest {
    title?: string;
    categoryId?: number;
}

export const updateTodo = async (
    todoId: number,
    data: UpdateTodoRequest
) => {
    try {
        const res = await api.patch(`/api/todos/${todoId}`, data);
        return res.data;
    } catch (error) {
        console.error('투두 수정 실패', error);
        throw error;
    }
};

// 투두 삭제
export const deleteTodo = async (todoId: number) => {
    try {
        const res = await api.delete(`/api/todos/${todoId}`);
        return res.data;
    } catch (error) {
        console.error('투두 삭제 실패', error);
        throw error;
    }
};