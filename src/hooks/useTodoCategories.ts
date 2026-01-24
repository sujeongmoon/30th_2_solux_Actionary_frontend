import { useState, useEffect } from "react";
import api from "../api/client"; // axios instance
import type { TodoCategory } from '../api/Todos/todoCategoriesApi';
import { useQueryClient, useQuery } from '@tanstack/react-query';

export const useTodoCategories = () => {
  const [categories, setCategories] = useState<TodoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  // ---------------- 초기 카테고리 로드 ----------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await api.get('/todo-categories');
        setCategories(res.data.data); // 원본 데이터를 그대로 저장
      } catch (err) {
        console.error('카테고리 불러오기 실패', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // ---------------- 카테고리 추가 ----------------
  const addCategory = async ({ name, color, startDate }: { name: string; color: string; startDate: string }) => {
    try {
      const res = await api.post('/todo-categories', { name, color, startDate });
      queryClient.invalidateQueries({ queryKey: ['todoCategories'] });
      setCategories(prev => [...prev, res.data.data]);
    } catch (err) {
      console.error('카테고리 추가 실패', err);
    }
  };

  // ---------------- 카테고리 수정 ----------------
  const editCategory = async (categoryId: number, data: { name: string; color: string }) => {
    try {
      await api.patch(`/todo-categories/${categoryId}`, data);
      setCategories(prev =>
        prev.map(cat => cat.categoryId === categoryId ? { ...cat, ...data } : cat)
      );
    } catch (err) {
      console.error('카테고리 수정 실패', err);
    }
  };

  // ---------------- 카테고리 삭제 ----------------
  const removeCategory = async (categoryId: number) => {
    try {
      await api.delete(`/todo-categories/${categoryId}`);
      setCategories(prev => prev.filter(cat => cat.categoryId !== categoryId));
    } catch (err) {
      console.error('카테고리 삭제 실패', err);
      throw err;
    }
  };

  // ---------------- 오늘 이후 카테고리만 필터링 함수 ----------------
  const getVisibleCategories = (selectedDate: string) => {
  const selected = new Date(selectedDate);
  selected.setHours(0, 0, 0, 0); // 선택한 날짜 0시 기준

  return categories.filter(cat => {
    const catStart = new Date(cat.startDate)
    catStart.setHours(0, 0, 0, 0);

    return selected >= catStart; // 선택한 날짜가 생성일 이후면 보여주기
  });
};



  return {
    categories,          // 원본 데이터
    getVisibleCategories, // 화면에서 쓸 필터링 데이터
    loading,
    addCategory,
    editCategory,
    removeCategory,
  };
};
