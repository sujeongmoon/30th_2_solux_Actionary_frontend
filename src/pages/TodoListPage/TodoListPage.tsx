import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './TodoListPage.css';
import { useTodos } from '../../hooks/useTodos';
import { useTodoCategoriesContext } from '../../context/TodoCategoriesContext';
import TodoCalendar from '../../components/TodoList/TodoCalendar';
import ddd from "../../assets/TodoList/ddd.svg";
import todoCheck from "../../assets/TodoList/todoCheck.svg";

import CategoryCreateModal from '../../components/TodoList/CategoryCreateModal';
import CategoryManageModal from '../../components/TodoList/CategoryManageModal';

interface TodoDropdownPosition {
  top: number;
  left: number;
}

const TodoListPage: React.FC = () => {
  const { todos, removeTodo } = useTodos();
  const { categories } = useTodoCategoriesContext();

  /* ======================== 날짜 상태 ======================== */
  const today = new Date();
  const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const [selectedDate, setSelectedDate] = useState(todayString);

  /* ========================= 드롭다운 상태 ======================== */
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);

  const [todoDropdownOpenId, setTodoDropdownOpenId] = useState<number | null>(null);
  const [todoDropdownPosition, setTodoDropdownPosition] = useState<TodoDropdownPosition>({ top: 0, left: 0 });

  const dropdownButtonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  /* ======================== 투두 드롭다운 위치 계산 ======================== */
  const handleTodoDropdownToggle = (todoId: number) => {
    const btn = dropdownButtonRefs.current[todoId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setTodoDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
    setTodoDropdownOpenId(prev => (prev === todoId ? null : todoId));
  };

  /* ======================== 외부 클릭 시 드롭다운 닫기 ======================== */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !(e.target as HTMLElement).closest('.todo-dropdown') &&
        !(e.target as HTMLElement).closest('.todo-dropdown-button')
      ) {
        setTodoDropdownOpenId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  /* ======================== 날짜 포맷 ======================== */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"];
    return `${date.getFullYear()} / ${date.getMonth() + 1} / ${date.getDate()} / ${days[date.getDay()]}`;
  };

  return (
    <div className="todo-page">
      <div className="todo-content">
        {/* 캘린더 */}
        <TodoCalendar
          selectedDate={selectedDate}
          onChangeDate={setSelectedDate}
          todos={todos}
        />

        {/* ========================= 투두 리스트 ======================== */}
        <div className="todo-container">
          <div className="todo-header">
            <span>{formatDate(selectedDate)}</span>

            <button
              className="category-dropdown-button"
              onClick={() => setCategoryDropdownOpen(v => !v)}
            >
              <img src={ddd} />
            </button>

            {categoryDropdownOpen && (
              <ul className="category-dropdown">
                <li onClick={() => setCreateModalOpen(true)}>카테고리 등록</li>
                <li onClick={() => setManageModalOpen(true)}>카테고리 관리</li>
              </ul>
            )}
          </div>

          {categories.map(cat => (
            <div key={cat.categoryId}>
              {todos
                .filter(t => t.categoryId === cat.categoryId && t.date === selectedDate)
                .map(todo => (
                  <div key={todo.todoId} className="todo-item">
                    <img src={todoCheck} />
                    <span>{todo.title}</span>

                    <button
                      className="todo-dropdown-button"
                      ref={(el) => {
                        dropdownButtonRefs.current[todo.todoId] = el;
                      }}
                      onClick={() => handleTodoDropdownToggle(todo.todoId)}
                    >
                      <img src={ddd} />
                    </button>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>


      {todoDropdownOpenId && ReactDOM.createPortal(
        <ul className="todo-dropdown" style={todoDropdownPosition}>
          <li onClick={() => removeTodo(todoDropdownOpenId)}>삭제</li>
        </ul>,
        document.body
      )}

      {createModalOpen && (<CategoryCreateModal onClose={() => setCreateModalOpen(false)} />)}
      {manageModalOpen && (<CategoryManageModal onClose={() => setManageModalOpen(false)} />)}
    </div>
  );
};

export default TodoListPage;