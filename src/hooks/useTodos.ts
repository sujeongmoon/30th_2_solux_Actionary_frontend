import { useEffect, useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import {
  getTodosByDate,
  createTodo,
  updateTodo,
  updateTodoStatus,
  deleteTodo,
  getMonthlyCalendarSummary,
} from "../api/Todos/todosApi";
import type { Todo, MonthlyCalendarSummary } from '../api/Todos/todosApi';

export type TodoStatus = "PENDING" | "DONE" | "FAILED";

export const useTodos = () => {
  const queryClient = useQueryClient();
  const todayString = new Date().toISOString().slice(0, 10);

  // ---------------- 상태 변수 ----------------
  const [calendarMap, setCalendarMap] = useState<Record<string, Todo[]>>({});
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  const [loading, setLoading] = useState(false);
  const [activeMonth, setActiveMonth] = useState(new Date());

  // ---------------- 아이콘용 월별 달성 개수 ----------------
  const [summaryMap, setSummaryMap] = useState<Record<string, MonthlyCalendarSummary>>({});
  const [doneMap, setDoneMap] = useState<Record<string, number>>({});
  const [summaryLoading, setSummaryLoading] = useState(false);

  // ---------------- 특정 날짜 투두 조회 ----------------
  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      try {
        const data: Todo[] = await getTodosByDate(selectedDate);
        const normalizedData: Todo[] = data.map(todo => ({
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

  // ---------------- 캘린더용 map 생성 ----------------
  useEffect(() => {
    const map: Record<string, Todo[]> = {};
    todos.forEach(todo => {
      if (!todo.date) return;
      const dateKey = todo.date.slice(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(todo);
    });
    setCalendarMap(map);
  }, [todos]);

  // ---------------- 투두 임시 추가 ----------------
  const addTodoItem = (categoryId: number): Todo => {
    const tempTodo: Todo = {
      todoId: Date.now() * -1,
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

      setTodos(prev => [...prev.filter(t => t.todoId !== tempTodoId), createdTodo]);
      queryClient.invalidateQueries({ queryKey: ['todos', selectedDate] });
    } catch (err) {
      console.error("투두 생성 실패", err);
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
      setTodos(prev => prev.map(t => t.todoId === todoId ? updatedTodo : t));
      queryClient.invalidateQueries({ queryKey: ['todos', selectedDate] });
    } catch (err) {
      console.error("투두 수정 실패", err);
    }
  };

  // ---------------- 상태 변경 ----------------
  const changeStatus = async (todoId: number, status: TodoStatus) => {
    try {
      const res = await updateTodoStatus(todoId, status);
      setTodos(prev =>
        prev.map(t => (t.todoId === todoId ? { ...t, status: res.data.status } : t))
      );
      queryClient.invalidateQueries({ queryKey: ['todos', selectedDate] });
    } catch (err) {
      console.error("투두 상태 변경 실패", err);
    }
  };

  // ---------------- 투두 삭제 ----------------
  const removeTodo = async (todoId: number) => {
    try {
      await deleteTodo(todoId);
      setTodos(prev => prev.filter(t => t.todoId !== todoId));
      queryClient.invalidateQueries({ queryKey: ['todos', selectedDate] });
    } catch (err) {
      console.error("투두 삭제 실패", err);
    }
  };

  // ---------------- 한 달치 달성 개수 조회 ----------------
  useEffect(() => {
    const fetchMonthlySummary = async () => {
      setSummaryLoading(true);
      try {
        const data: MonthlyCalendarSummary[] = await getMonthlyCalendarSummary(
          activeMonth.getFullYear(),
          activeMonth.getMonth() + 1
        );
        const summary: Record<string, MonthlyCalendarSummary> = {};
        const done: Record<string, number> = {};
        data.forEach(item => {
          summary[item.date] = item;
          done[item.date] = item.doneCount;
        });
        setSummaryMap(summary);
        setDoneMap(done);
      } catch (err) {
        console.error('월별 요약 불러오기 실패', err);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchMonthlySummary();
  }, [activeMonth]);

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
    activeMonth,
    setActiveMonth, // TodoCalendar에서 달 이동 시 업데이트용
    summaryMap,     // 달력 아이콘용 전체 info
    doneMap,        // 달성 개수만
    summaryLoading,
  };
};

export default useTodos;
