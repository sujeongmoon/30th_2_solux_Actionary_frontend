import { useEffect, useState } from "react";
import React from "react";
import type { ApiEnvelope } from "../api/types";
import { getTodosByDate, createTodo, updateTodo, updateTodoStatus, deleteTodo } from "../api/Todos/todosApi";
import type{ Todo as ApiTodo } from "../api/Todos/todosApi";

export interface Todo extends ApiTodo {}

export const useTodos = () => {
  const today = new Date();
  const todayString = today.toISOString().slice(0, 10);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  const [loading, setLoading] = useState(false);

  const normalizeDate = (date: string) => 
    new Date(date).toISOString().slice(0,10);

  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      try {
        const data = await getTodosByDate(selectedDate);
        const normalized = data.map(todo => ({
          ...todo,
          date: normalizeDate(todo.date),
        }));
        setTodos(normalized);
      } catch (err) {
        console.error("투두 조회 실패", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, [selectedDate]);

  // 투두 추가
  const addTodoItem = (categoryId: number): Todo => {
    const tempTodo: Todo = {
      todoId: Date.now() * -1,
      title: '',
      date: selectedDate,
      categoryId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    setTodos(prev => [...prev, tempTodo]);
    return tempTodo;
  };

  const createTodoOnServer = async (
    tempTodoId: number,
    title: string,
    categoryId?: number | null
  ) => {
    const res = await createTodo({
      title,
      date: selectedDate,
      categoryId,
    });
    const normalizedTodo = {
      ...res.data,
      date: normalizeDate(res.data.date),
    };
    setTodos(prev =>
      prev.map(t => (t.todoId === tempTodoId ? normalizedTodo : t))
    );
  };

  // 투두 수정
  const editTodo = async (todoId: number, data: { title?: string; categoryId?: number}) => {
    try {
      const res = await updateTodo(todoId, data);
      const normalizedTodo = {
        ...res.data,
        date: normalizeDate(res.data.date),
      };
      setTodos(prev => 
        prev.map(t => (t.todoId === todoId ? normalizedTodo : t))
      );
    } catch (err) {
      console.error("투두 수정 실패", err);
    }
  };

  // 상태 변경
  const changeStatus = async (todoId: number, status: "PENDING" | "DONE" | "FAILED") => {
    try {
      const res = await updateTodoStatus(todoId, status);
      setTodos(prev => prev.map(t => t.todoId === todoId ? { ...t, status: res.data.status } : t));
    } catch (err) {
      console.error("투두 상태 변경 실패", err);
    }
  };

  // 투두 삭제
  const removeTodo = async(todoId: number) => {
    try {
      await deleteTodo(todoId);
      setTodos(prev => prev.filter(t => t.todoId !== todoId));
    } catch (err) {
      console.error("투두 삭제 실패", err);
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    todos,
    addTodoItem,
    createTodoOnServer,
    removeTodo,
    editTodo,
    changeStatus,
    setTodos,
  };
};

export default useTodos;

