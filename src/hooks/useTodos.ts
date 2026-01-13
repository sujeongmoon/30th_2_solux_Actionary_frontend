import { useState } from "react";

export interface Todo {
  todoId: number;
  categoryId: number;
  title: string;
  date: string;
  status: "DOING" | "DONE";
}

export const useTodos = () => {
  const today = new Date();
  const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  // 🔹 목업 데이터
  const mockTodos: Todo[] = [
    { todoId: 1, categoryId: 1, title: "React 공부", date: todayString, status: "DONE" },
    { todoId: 2, categoryId: 1, title: "TypeScript 학습", date: todayString, status: "DOING" },
    { todoId: 3, categoryId: 2, title: "헬스장 가기", date: todayString, status: "DONE" },
    { todoId: 4, categoryId: 2, title: "조깅", date: todayString, status: "DOING" },
    { todoId: 5, categoryId: 2, title: "스트레칭", date: todayString, status: "DONE" },
  ];

  const [todos, setTodos] = useState<Todo[]>(mockTodos);
  const [selectedDate, setSelectedDate] = useState<string>(todayString);

  const addTodo = (todo: Omit<Todo, "todoId">) => {
    setTodos(prev => [
      ...prev,
      { ...todo, todoId: Date.now() },
    ]);
  };

  const removeTodo = (todoId: number) => {
    setTodos(prev => prev.filter(t => t.todoId !== todoId));
  };

  const editTodo = (todoId: number, data: Partial<Todo>) => {
    setTodos(prev => prev.map(t => t.todoId === todoId ? { ...t, ...data } : t));
  };

  const changeStatus = (todoId: number, status: "DOING" | "DONE") => {
    setTodos(prev => prev.map(t => t.todoId === todoId ? { ...t, status } : t));
  };

  return {
    selectedDate,
    setSelectedDate,
    todos,
    addTodo,
    removeTodo,
    editTodo,
    changeStatus,
  };
};
