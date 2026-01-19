import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      try {
        const data = await getTodosByDate(selectedDate);
        setTodos(data);
      } catch (err) {
        console.error("투두 조회 실패", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, [selectedDate]);

  // 투두 추가
  const addTodoItem = async (categoryId: number): Promise<Todo> => {
    try {
      const res = await createTodo({ title: "|", date: selectedDate, categoryId});
      console.log("새 투두:", res.data);
      setTodos(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("투두 생성 실패", err);
      throw err;
    }
  };

  // 투두 수정
  const editTodo = async (todoId: number, data: { title?: string; categoryId?: number}) => {
    try {
      const res = await updateTodo(todoId, data);
      setTodos(prev => prev.map(t => (t.todoId === todoId ? res.data : t)));
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
    removeTodo,
    editTodo,
    changeStatus,
  };
};

export default useTodos;
