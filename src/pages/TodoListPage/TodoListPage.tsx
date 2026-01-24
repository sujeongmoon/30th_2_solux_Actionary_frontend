import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './TodoListPage.css';
import TodoCalendar from '../../components/TodoList/TodoCalendar';
import ddd from "../../assets/TodoList/ddd.svg";
import todoCheck from "../../assets/TodoList/todoCheck.svg";
import { useTodoCategoriesContext } from '../../context/TodoCategoriesContext';
import { useTodos } from '../../hooks/useTodos';
import type { Todo } from '../../api/Todos/todosApi';
// 모달 컴포넌트
import CategoryCreateModal from '../../components/TodoList/CategoryCreateModal';
import CategoryManageModal from '../../components/TodoList/CategoryManageModal';
import CategoryEditModal from '../../components/TodoList/CategoryEditModal';
import { ReactMarkView } from '@tiptap/react';


// import 구문은 그대로 유지
const TodoListPage: React.FC = () => {
  const { todos, selectedDate, setSelectedDate, addTodoItem, editTodo, removeTodo, changeStatus, createTodoOnServer, calendarMap } = useTodos();

  const isCreatingRef = useRef(false);

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [editTodoId, setEditTodoId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const [todoDropdownOpenId, setTodoDropdownOpenId] = useState<number | null>(null);
  const [todoDropdownPosition, setTodoDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownButtonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  const categoryButtonRef = useRef<HTMLButtonElement | null>(null);
  const [categoryDropdownPosition, setCategoryDropdownPosition] = useState({ top: 0, left: 0 });

  const { categories } = useTodoCategoriesContext();
  const visibleCategories = categories.filter(cat => {
  const start = new Date(cat.startDate); // startDate 기준
    start.setHours(0,0,0,0);
    const selected = new Date(selectedDate);
    selected.setHours(0,0,0,0);
    return selected >= start; // 선택한 날짜 이후면 보이기
  });


  const handleAddTodo = (categoryId: number) => {
    const tempTodo = addTodoItem(categoryId);
    setEditTodoId(tempTodo.todoId);
    setEditingTitle('');
  };

  const todoOfSelectedDate = calendarMap[selectedDate] ?? [];

  // 드롭다운 위치 계산
  const handleTodoDropdownToggle = (todoId: number) => {
    const btn = dropdownButtonRefs.current[todoId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setTodoDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
    setTodoDropdownOpenId(prev => (prev === todoId ? null : todoId));
  };

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.todo-dropdown') && !(e.target as HTMLElement).closest('.todo-dropdown-button')) {
        setTodoDropdownOpenId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"];
    return `${date.getFullYear()} / ${date.getMonth()+1} / ${date.getDate()} / ${days[date.getDay()]}`;
  };

  return (
    <div className="todo-page">
      <div className="todo-content">
        <TodoCalendar selectedDate={selectedDate} onChangeDate={setSelectedDate} calendarMap={calendarMap} />

        <div className="todo-container">
          <div className="todo-header">
            <span>{formatDate(selectedDate)}</span>
            <button
              ref={categoryButtonRef}
              className="category-dropdown-button"
              onClick={() => {
                const rect = categoryButtonRef.current!.getBoundingClientRect();
                setCategoryDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                setCategoryDropdownOpen(v => !v);
              }}
            >
              <img src={ddd} alt="카테고리 옵션" />
            </button>
          </div>

          {visibleCategories.map(cat => (
            <div key={cat.categoryId} className="category-block">
              <div className="category-header">
                <div className="category-name" style={{borderColor: cat.color, color: cat.color}}>{cat.name}</div>
                <button className="add-cat-button" onClick={() => handleAddTodo(cat.categoryId)}>+</button>
              </div>

              {todoOfSelectedDate.filter(t => t.categoryId === cat.categoryId).map(todo => (
                <div key={todo.todoId} className="todo-item">
                  <img src={todoCheck} className="todo-check-icon" alt="체크" />

                  {editTodoId === todo.todoId ? (
                    <input
                      type="text"
                      value={editingTitle}
                      placeholder="| 새 할 일 + Enter"
                      onChange={e => setEditingTitle(e.target.value)}
                      onKeyDown={async e => {
                        if(e.key !== 'Enter') return;
                        if(isCreatingRef.current) return;
                        isCreatingRef.current = true;

                        try {
                          const trimmed = editingTitle.trim();
                          if(trimmed === '') {
                            if(todo.todoId < 0) setTodos(prev => prev.filter(t => t.todoId !== todo.todoId));
                            setEditTodoId(null);
                            return;
                          }
                          if(todo.todoId < 0) await createTodoOnServer(todo.todoId, trimmed, todo.categoryId);
                          else await editTodo(todo.todoId, { title: trimmed });
                          setEditingTitle('');
                          setEditTodoId(null);
                        } finally { isCreatingRef.current = false; }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span onClick={() => { setEditTodoId(todo.todoId); setEditingTitle(todo.title); }}>
                      {todo.title || "새 할 일"}
                    </span>
                  )}

                  <div className="btn-group">
                    <button className={`todo-status-btn success ${todo.status === 'DONE' ? 'active' : ''}`} onClick={() => changeStatus(todo.todoId, 'DONE')}>달성</button>
                    <button className={`todo-status-btn fail ${todo.status === 'FAILED' ? 'active' : ''}`} onClick={() => changeStatus(todo.todoId, 'FAILED')}>실패</button>

                    <button className="todo-dropdown-button" ref={el => dropdownButtonRefs.current[todo.todoId]=el} onClick={() => handleTodoDropdownToggle(todo.todoId)}>
                      <img src={ddd} className="todo-dropdown-button" alt="옵션" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {todoDropdownOpenId !== null && (
        <ul className="todo-dropdown" style={{ position: 'absolute', top: todoDropdownPosition.top-27, left: todoDropdownPosition.left+25 }}>
          <li onClick={() => { const todo = todos.find(t => t.todoId === todoDropdownOpenId); if(todo) setEditingTitle(todo.title); setEditTodoId(todoDropdownOpenId); setTodoDropdownOpenId(null); }}>수정</li>
          <li onClick={() => { removeTodo(todoDropdownOpenId); setTodoDropdownOpenId(null); }}>삭제</li>
        </ul>
      )}

      {categoryDropdownOpen && ReactDOM.createPortal(
        <ul className="category-dropdown" style={{ position:'absolute', top:categoryDropdownPosition.top, left:categoryDropdownPosition.left }}>
          <li onClick={() => { setCreateModalOpen(true); setCategoryDropdownOpen(false); }}>카테고리 등록</li>
          <li onClick={() => { setManageModalOpen(true); setCategoryDropdownOpen(false); }}>카테고리 관리</li>
        </ul>, document.body
      )}

      {createModalOpen && <CategoryCreateModal onClose={() => setCreateModalOpen(false)} selectedDate={selectedDate} />}
      {manageModalOpen && <CategoryManageModal onClose={() => setManageModalOpen(false)} />}
    </div>
  );
};

export default TodoListPage;
