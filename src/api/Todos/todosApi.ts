import { api } from '../client';


// 특정 날짜 투두리스트 조회
export const getTodosByDate = async (date: string): Promise<Todo[]> => {
    try {
        const res = await api.get(`/todos`, {
            params: {date},
        });
        return res.data.data.todos; // 수정: 실제 todos 배열 반환
    } catch (error) {
        console.error('투두리스트 조회 실패', error);
        throw error;
    }
};

// 투두리스트 달성, 실패 (수정)
export type TodoStatus = 'PENDING' | 'DONE' | 'FAILED';

export const updateTodoStatus = async (
    todoId: number,
    status: TodoStatus
): Promise<{success: boolean; data: { todoId: number; status: TodoStatus}}> => {
    try {
        const res = await api.patch(`/todos/${todoId}/status`, {status});
        return res.data;
    } catch (error) {
        console.error('투두 상태 변경 실패', error);
        throw error;
    }
};

export interface Todo {
  todoId: number;
  title: string;
  categoryId?: number;
  status: TodoStatus;
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
}: CreateTodoRequest): Promise<{ success: boolean; data: Todo}> => {
    try {
        const res = await api.post('/todos', {
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
): Promise<{success: boolean; data: Todo}> => {
    try {
        const res = await api.patch(`/todos/${todoId}`, data);
        return res.data;
    } catch (error) {
        console.error('투두 수정 실패', error);
        throw error;
    }
};

// 투두 삭제
export const deleteTodo = async (todoId: number): Promise<{success: boolean; message: string}> => {
    try {
        const res = await api.delete(`/todos/${todoId}`);
        return res.data;
    } catch (error) {
        console.error('투두 삭제 실패', error);
        throw error;
    }
};
