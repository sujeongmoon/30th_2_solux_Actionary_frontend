import { api } from '../client';
import { type CreateCategoryResponse } from '../../types/Todo';

// 카테고리 타입
export interface TodoCategory {
  categoryId: number;
  name: string;
  color: string;
  createdAt: string;
  startDate: string;
}

// 카테고리 생성
export interface CreateCategoryRequest {
  name: string;
  color: string;
  startDate: string;
}

export const createTodoCategory = async (
  data: CreateCategoryRequest
) : Promise<CreateCategoryResponse> => {
  try {
    const res = await api.post<CreateCategoryResponse>('/todo-categories', data);
    return res.data;
  } catch (error) {
    console.error ('카테고리 생성 실패', error);
    throw error;
  }
};

// 카테고리 목록 조회
export const getTodoCategories = async () => {
  try {
    const res = await api.get('/todo-categories');
    return res.data;
  } catch (error) {
    console.error('카테고리 목록 조회 실패', error);
    throw error;
  }
};

// 카테고리 수정
export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
}

export const updateTodoCategory = async (
  categoryId: number,
  data: UpdateCategoryRequest
) => {
  try {
    const res = await api.patch(
      `/todo-categories/${categoryId}`,
      data
    );
    return res.data;
  } catch (error) {
    console.error('카테고리 수정 실패', error);
    throw error;
  } 
};

// 카테고리 삭제
export const deleteTodoCategory = async (categoryId: number) => {
  try {
    const res = await api.delete(
      `/todo-categories/${categoryId}`
    );
    return res.data;
  } catch (error) {
    console.error('카테고리 삭제 실패', error);
    throw error;
  }
};