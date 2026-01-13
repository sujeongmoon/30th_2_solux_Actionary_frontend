import { useState } from "react";
import type { TodoCategory } from '../api/Todos/todoCategoriesApi';

export const useTodoCategories = () => {
  const [categories, setCategories] = useState<TodoCategory[]>([]);

  // 카테고리 추가 (백엔드 X)
  const addCategory = async ({ name, color }: { name: string; color: string }) => {
    setCategories(prev => [
      ...prev,
      {
        categoryId: Date.now(), // 임시 ID
        name,
        color,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  // 수정
  const editCategory = async (categoryId: number, data: { name: string; color: string }) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.categoryId === categoryId ? { ...cat, ...data } : cat
      )
    );
  };

  // 삭제
  const removeCategory = async (categoryId: number) => {
    setCategories(prev =>
      prev.filter(cat => cat.categoryId !== categoryId)
    );
  };

  return {
    categories,
    addCategory,
    editCategory,
    removeCategory,
  };
};
