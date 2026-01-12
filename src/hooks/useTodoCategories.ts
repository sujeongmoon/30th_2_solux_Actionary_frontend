import { useEffect, useState } from "react";
import type {
  TodoCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../api/Todos/todoCategoriesApi';
import {
  getTodoCategories,
  createTodoCategory,
  updateTodoCategory,
  deleteTodoCategory,
} from '../api/Todos/todoCategoriesApi';


export const useTodoCategories = () => {
  const [categories, setCategories] = useState<TodoCategory[]>([]);
  
  const fetchCategories = async () => {
    try {
      const res = await getTodoCategories();
      
      if (Array.isArray(res)) {
        setCategories(res);
      } else if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        setCategories([]);
      }

    } catch (error) {
      console.error("카테고리 조회 실패:",error);
      setCategories([]);
    }
  };

    useEffect(() => {
    fetchCategories();
    }, []);

  const addCategory = async (data: CreateCategoryRequest) => {
    try {
      await createTodoCategory(data);
      await fetchCategories();
    } catch (error) {
      console.error("카테고리 수정 실패:",error);
    }
  };

  const editCategory = async (categoryId: number, data: UpdateCategoryRequest) => {
    try {
      await updateTodoCategory(categoryId, data);
      await fetchCategories();
    } catch (error) {
      console.error("카테고리 수정 실패:", error);
    }
  };

  const removeCategory = async (categoryId: number) => {
    try{
      await deleteTodoCategory(categoryId);
      setCategories(prev =>
      prev.filter(cat => cat.categoryId !== categoryId)
    );
   } catch (error) {
    console.error("카테고리 삭제 실패:", error);
    }
  };

  return {
    categories,
    addCategory,
    editCategory,
    removeCategory,
  };
};