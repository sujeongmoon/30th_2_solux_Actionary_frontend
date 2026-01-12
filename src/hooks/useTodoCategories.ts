import { useEffect, useState } from "react";
import type { TodoCategory } from '../api/Todos/todoCategoriesApi';

export const useTodoCategories = () => {
  // 🔧 [수정] 더미 카테고리 상태
  const [categories, setCategories] = useState<TodoCategory[]>([]);

  // 🔧 [수정] 더미 초기 데이터
  useEffect(() => {
    setCategories([
      {
        categoryId: 1,
        name: "공부",
        color: "#FF3D2F",
        createdAt: new Date().toISOString(),
      },
      {
        categoryId: 2,
        name: "운동",
        color: "#6BEBFF",
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  // 🔧 [수정] 카테고리 추가 (백엔드 X)
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

  // 🔧 [수정] 수정
  const editCategory = async (categoryId: number, data: { name: string; color: string }) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.categoryId === categoryId ? { ...cat, ...data } : cat
      )
    );
  };

  // 🔧 [수정] 삭제
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
