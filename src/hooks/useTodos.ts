import { useEffect, useState } from "react";
import type {
  Todo,
  TodoStatus,
  CreateTodoRequest,
  UpdateTodoRequest,
} from '../api/Todos/todosApi';
import {
  getTodosByDate,
  createTodo,
  updateTodo,
  updateTodoStatus,
  deleteTodo,
} from '../api/Todos/todosApi';

const getTodayString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
};

export const useTodos = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchTodos = async () => {
      setLoading(true);
      try {
        const data = await getTodosByDate(selectedDate);
        setTodos(data);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [selectedDate]);

  const addTodo = async (data: CreateTodoRequest) => {
    setLoading(true);
    try {
     await createTodo(data);
      const refreshed = await getTodosByDate(data.date);
      setTodos(refreshed);
    } catch (error) {
      console.error("투두 추가 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const editTodo = async (todoId: number, data: UpdateTodoRequest) => {
    setLoading(true);
    try {
      await updateTodo(todoId, data);
      if (selectedDate) {
        const refreshed = await getTodosByDate(selectedDate);
        setTodos(refreshed);
      }
    } catch (error) {
      console.error("투두 수정 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (todoId: number, status: TodoStatus) => {
    setLoading(true);
    try {
      await updateTodoStatus(todoId, status);
      if (selectedDate) {
        const refreshed = await getTodosByDate(selectedDate);
        setTodos(refreshed);
      }
    } catch (error) {
      console.error("투두 상태 변경 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeTodo = async (todoId: number) => {
    setLoading(true);
    try{
      await deleteTodo(todoId);
      setTodos(prev => prev.filter(todo => todo.todoId !== todoId));
    } catch (error) {
      console.error("투두 삭제 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    todos,
    loading,
    addTodo,
    editTodo,
    changeStatus,
    removeTodo,
    getTodayString,
  };
};