import { useEffect, useState } from "react";
import {
  getTodosByDate,
  createTodo,
  updateTodo,
  updateTodoStatus,
  deleteTodo,
} from "../api/Todos/todosApi";
import type { Todo } from '../api/Todos/todosApi';

export type TodoStatus = "PENDING" | "DONE" | "FAILED";


export const useTodos = () => {
  // 오늘 날짜 (YYYY-MM-DD)
  const todayString = new Date().toISOString().slice(0, 10);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  const [loading, setLoading] = useState(false);

  // ---------------- 특정 날짜 투두 조회 ----------------
  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      try {
        const data: Todo[] = await getTodosByDate(selectedDate);
        const normalizedData: Todo[] = data.map((todo:Todo) => ({
          ...todo,
          date: todo.date ? todo.date.slice(0, 10) : selectedDate,
        }));
        
        setTodos(prev => {
          const nonTemp = prev.filter(t => t.date !== selectedDate);
          return [...nonTemp, ...normalizedData];
        });
      } catch (err) {
        console.error("투두 조회 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [selectedDate]);

  // ---------------- 캘린더용 맵 ----------------
const calendarMap = todos.reduce<Record<string, Todo[]>>((acc, todo) => {
  if (!todo.date) return acc;
  const dateKey = todo.date.slice(0, 10);

  if (!acc[dateKey]) {
    acc[dateKey] = [];
  }
  acc[dateKey].push(todo);
  /*acc[todo.date] = acc[todo.date]
    ? [...acc[todo.date], todo]
    : [todo];*/
  /*const date = selectedDate; // 서버에서 날짜별 조회하므로 전부 이 날짜
  acc[date] = acc[date] ? [...acc[date], todo] : [todo]; */
  return acc;
}, {});


  

  // ---------------- 투두 임시 추가 (UI용) ----------------
  const addTodoItem = (categoryId: number): Todo => {
    const tempTodo: Todo = {
      todoId: Date.now() * -1, // 임시 음수 ID
      title: "",
      date: selectedDate,
      categoryId,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    setTodos(prev => [...prev, tempTodo]);
    return tempTodo;
  };

  // ---------------- 서버에 투두 생성 ----------------
  const createTodoOnServer = async (
    tempTodoId: number,
    title: string,
    categoryId?: number | null
  ) => {
    try {
      const res = await createTodo({
        title,
        date: selectedDate,
        categoryId,
      });

      const createdTodo: Todo = {
      todoId: res.data.todoId,
      title: res.data.title,
      categoryId: res.data.categoryId,
      status: res.data.status,
      date: selectedDate,
      createdAt: res.data.createdAt,
    };

      setTodos(prev =>
        //prev.map(t => (t.todoId === tempTodoId ? createdTodo : t))
        [...prev.filter(t => t.todoId !== tempTodoId), createdTodo]
      );
    } catch (err) {
      console.error("투두 생성 실패", err);
      // 실패 시 임시 투두 제거
      setTodos(prev => prev.filter(t => t.todoId !== tempTodoId));
    }
  };

  // ---------------- 투두 수정 ----------------
  const editTodo = async (
    todoId: number,
    data: { title?: string; categoryId?: number }
  ) => {
    try {
      const res = await updateTodo(todoId, data);
      const updatedTodo: Todo = {
        todoId: res.data.todoId,
        title: res.data.title,
        categoryId: res.data.categoryId,
        status: res.data.status,
        date: res.data.date ?? selectedDate,
        createdAt: res.data.createdAt,
      };


      setTodos(prev =>
        prev.map(t => (t.todoId === todoId ? updatedTodo : t))
      );
    } catch (err) {
      console.error("투두 수정 실패", err);
    }
  };

  // ---------------- 상태 변경 ----------------
  const changeStatus = async (
    todoId: number,
    status: "PENDING" | "DONE" | "FAILED"
  ) => {
    try {
      const res = await updateTodoStatus(todoId, status);
      setTodos(prev =>
        prev.map(t =>
          t.todoId === todoId ? { ...t, status: res.data.status } : t
        )
      );
    } catch (err) {
      console.error("투두 상태 변경 실패", err);
    }
  };

  // ---------------- 투두 삭제 ----------------
  const removeTodo = async (todoId: number) => {
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
    loading,
    addTodoItem,
    createTodoOnServer,
    editTodo,
    changeStatus,
    removeTodo,
    setTodos,
    calendarMap,
  };
};



export default useTodos;
