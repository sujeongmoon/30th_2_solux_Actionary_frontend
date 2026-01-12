import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'
import './TodoListPage.css'
import { useTodos } from '../../hooks/useTodos';
import { useTodoCategoriesContext } from '../../context/TodoCategoriesContext';
import ddd from "../../assets/TodoList/ddd.svg";
import todoCheck from "../../assets/TodoList/todoCheck.svg"
import type { CreateTodoRequest } from '../../api/Todos/todosApi';
import CategoryCreateModal from '../../components/TodoList/CategoryCreateModal';
import CategoryManageModal from '../../components/TodoList/CategoryManageModal';

interface TodoDropdownPosition {
  top: number;
  left: number;
}

const TodoListPage: React.FC = () => {
  const { todos, loading, addTodo, editTodo, changeStatus, removeTodo } = useTodos();
  const { categories } = useTodoCategoriesContext();

  // 상태 관리
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [todoDropdownOpenId, setTodoDropdownOpenId] = useState<number | null>(null);
  const [todoDropdownPosition, setTodoDropdownPosition] = useState<TodoDropdownPosition>({top:0, left:0}); 
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayString);

  const dropdownButtonRefs = useRef<{[key: number]: HTMLButtonElement | null}>({});

  // 날짜 클릭
  const handleDateChange = (value: any) => {
    if (!value) return;
    const date: Date = Array.isArray(value) ? value[0] : value;
    if (!(date instanceof Date)) return;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    setSelectedDate(`${year}-${month}-${day}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ["일요일", "월요일" , "화요일", "수요일", "목요일", "금요일", "토요일"];
    const dayName = dayNames[date.getDay()];
    
    return `${year} / ${month} / ${day} / ${dayName}`;
  }

  // 투두 생성
  const handleAddTodo = (categoryId?: number) => {
    if (!selectedDate) return;
    const newTodo: CreateTodoRequest = { title: "새 할 일", date: selectedDate, categoryId};
    addTodo(newTodo);
  };

  const handleEditTodo = (todoId: number) => {
    if (!editingText.trim()) return;
    editTodo(todoId, { title: editingText });
    setEditingTodoId(null);
    setEditingText("");
  };

  // 🔹 새로 추가됨: 투두 드롭다운 열기 및 위치 계산
  const handleTodoDropdownToggle = (todoId: number) => {
    const buttonEl = dropdownButtonRefs.current[todoId];
    if (buttonEl) {
      const rect = buttonEl.getBoundingClientRect();
      setTodoDropdownPosition({top: rect.bottom + window.scrollY, left: rect.left + window.scrollX});
    }
    setTodoDropdownOpenId(prev => prev === todoId ? null : todoId);
  }

  // 🔹 새로 추가됨: 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.todo-dropdown') &&
          !(e.target as HTMLElement).closest('.todo-dropdown-button')) {
        setTodoDropdownOpenId(null);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="todo-page">
      <div className="calendar-container">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate ? new Date(selectedDate) : new Date()}
          locale="ko-KR"
          calendarType="gregory"
          prev2Label={null}
          next2Label={null}
          formatDay={(_,date) => date.getDate().toString()}
        />
      </div>

      <div className="todo-container">
        <div className="todo-header">
          <span>{selectedDate ? formatDate(selectedDate) : ""}</span>
          <div className="category-dropdown-wrapper">
            <button
              className="category-dropdown-button"
              onClick={() => setCategoryDropdownOpen(prev => !prev)}
            >
              <img src={ddd} alt="dropdown"/>
            </button>
            {categoryDropdownOpen && (
              <ul className="category-dropdown">
                <li 
                  onClick={() => { setCreateModalOpen(true); setCategoryDropdownOpen(false);}}> 카테고리 등록</li>
                <li 
                  onClick={() => { setManageModalOpen(true); setCategoryDropdownOpen(false);}}> 카테고리 관리</li>
              </ul>
            )}
          </div>
        </div>

        <div className="categories-list">
          {categories.map(cat => (
            <div key={cat.categoryId} className="category-block">
              <div className="category-header">
                <div className="category-name" style={{ border: `2px solid ${cat.color}`, color: cat.color}}>
                  {cat.name}
                </div>
                <button className="add-cat-button" onClick={() => handleAddTodo(cat.categoryId)}>+</button>
              </div>

              <div className="todo-list">
                {todos.filter(todo => todo.categoryId === cat.categoryId).map(todo => (
                  <div key={todo.todoId} className="todo-item">
                    <img src={todoCheck} alt="checkIcon" className="todo-check-icon"/>
                    {editingTodoId === todo.todoId ? (
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => handleEditTodo(todo.todoId)}
                        onKeyDown={(e) => { if(e.key === "Enter") handleEditTodo(todo.todoId) }}
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() => { setEditingTodoId(todo.todoId); setEditingText(todo.title); }}
                      > {todo.title} </span>
                    )}

                    <div className="btn-group">
                      <button
                        className={`todo-status-btn success ${todo.status === 'DONE' ? 'active' : ''}`}
                        onClick={() => changeStatus(todo.todoId,'DONE')}
                      > 달성 </button>
                      <button
                        className={`todo-status-btn fail ${todo.status === 'FAILED' ? 'active' : ''}`}
                        onClick={() => changeStatus(todo.todoId,'FAILED')}
                      > 실패 </button>

                      <button
                        ref={el => { dropdownButtonRefs.current[todo.todoId] = el}}
                        className="todo-dropdown-button"
                        onClick={() => handleTodoDropdownToggle(todo.todoId)}
                      >
                        <img src={ddd} alt="dropdown" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {loading && <div className="loading"> 로딩중...</div>}
      </div>

      {todoDropdownOpenId !== null && ReactDOM.createPortal(
        <ul className="todo-dropdown" style={{top: todoDropdownPosition.top, left: todoDropdownPosition.left}}>
          <li onClick={() => { setEditingTodoId(todoDropdownOpenId); setEditingText(todos.find(t=>t.todoId===todoDropdownOpenId)?.title || ''); setTodoDropdownOpenId(null); }}>수정</li>
          <li onClick={() => { removeTodo(todoDropdownOpenId); setTodoDropdownOpenId(null); }}>삭제</li>
        </ul>,
        document.body
      )}

      {createModalOpen && <CategoryCreateModal onClose={()=> setCreateModalOpen(false)} />}
      {manageModalOpen && <CategoryManageModal onClose={()=> setManageModalOpen(false)} />}
    </div>
  );
};

export default TodoListPage;

