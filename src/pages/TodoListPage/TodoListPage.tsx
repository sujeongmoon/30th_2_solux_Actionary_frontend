import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './TodoListPage.css';
import TodoCalendar from '../../components/TodoList/TodoCalendar';
import ddd from "../../assets/TodoList/ddd.svg";
import todoCheck from "../../assets/TodoList/todoCheck.svg";
import { useTodoCategoriesContext } from '../../context/TodoCategoriesContext';
import { useTodos } from '../../hooks/useTodos';

// 모달 컴포넌트
import CategoryCreateModal from '../../components/TodoList/CategoryCreateModal';
import CategoryManageModal from '../../components/TodoList/CategoryManageModal';
import CategoryEditModal from '../../components/TodoList/CategoryEditModal';

// 목업 데이터 타입
interface Todo {
  todoId: number;
  categoryId: number;
  title: string;
  status: 'DONE' | 'TODO' | 'FAIL';
  date: string;
}

interface Category {
  categoryId: number;
  name: string;
  color: string;
}

interface TodoDropdownPosition {
  top: number;
  left: number;
}

// 목업 데이터
const mockCategories: Category[] = [
  { categoryId: 1, name: '공부', color: '#FF3D2F' },
  { categoryId: 2, name: '운동', color: '#6BEBFF' },
];

const mockTodos: Todo[] = [
  { todoId: 1, categoryId: 1, title: '수학 공부', status: 'DONE', date: '2026-1-12' },
  { todoId: 2, categoryId: 1, title: '영어 단어 외우기', status: 'TODO', date: '2026-1-12' },
  { todoId: 3, categoryId: 2, title: '조깅 30분', status: 'DONE', date: '2026-1-12' },
  { todoId: 4, categoryId: 2, title: '팔 운동', status: 'TODO', date: '2026-1-12' },
  { todoId: 5, categoryId: 1, title: '코딩 연습', status: 'DONE', date: '2026-1-13' },
];

const TodoListPage: React.FC = () => {
  // 상태
  const today = new Date();
  const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  const [selectedDate, setSelectedDate] = useState(todayString);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [todos, setTodos] = useState<Todo[]>(mockTodos);

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTodoId, setEditTodoId] = useState<number | null>(null);
  const [editTodoText, setEditTodoText] = useState<string>('');

  const [todoDropdownOpenId, setTodoDropdownOpenId] = useState<number | null>(null);
  const [todoDropdownPosition, setTodoDropdownPosition] = useState<TodoDropdownPosition>({ top: 0, left: 0 });
  const dropdownButtonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  // 투두 드롭다운 위치 계산
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

  // 외부 클릭 시 드롭다운 닫기
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

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"];
    return `${date.getFullYear()} / ${date.getMonth() + 1} / ${date.getDate()} / ${days[date.getDay()]}`;
  };

  // 투두 상태 토글
  const toggleTodoStatus = (todoId: number, status: 'DONE' | 'FAIL') => {
    setTodos(prev =>
      prev.map(todo =>
        todo.todoId === todoId
          ? { ...todo, status: status }
          : todo
      )
    );
  };


  // 투두 삭제
  const removeTodo = (todoId: number) => {
    setTodos(prev => prev.filter(todo => todo.todoId !== todoId));
    setTodoDropdownOpenId(null);
  };

  // 투두 추가 (간단한 목업)
  const addTodo = (categoryId: number) => {
    const newTodo: Todo = {
      todoId: Date.now(),
      categoryId,
      title: '',
      status: 'TODO',
      date: selectedDate,
    };
    setTodos(prev => [...prev, newTodo]);
    setEditTodoId(newTodo.todoId);
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, todo: Todo) => {
    if (e.key === 'Enter') {
      if (todo.title.trim() === '') {
        setTodos(prev =>
          prev.map(td =>
            td.todoId === todo.todoId ? {...td, title: td.title || todo.title} : td
          )
        );
      }
      setEditTodoId(null);
    }
  };

  const isToday = selectedDate === todayString;


  return (
    <div className="todo-page">
      <div className="todo-content">
        {/* 캘린더 */}
        <TodoCalendar
          selectedDate={selectedDate}
          onChangeDate={setSelectedDate}
          todos={todos}
        />

        {/* 투두리스트 */}
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
              <ul 
                className="category-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '100%',
                }}>
                <li onClick={() => setCreateModalOpen(true)}>카테고리 등록</li>
                <li onClick={() => setManageModalOpen(true)}>카테고리 관리</li>
              </ul>
            )}
          </div>

          {categories.map(cat => (
            <div key={cat.categoryId} className="category-block">
              <div className="category-header">
                <div
                  className="category-name"
                  style={{borderColor: cat.color, color: cat.color}}
                >
                  {cat.name}
                </div>


                {isToday && (
                  <button className="add-cat-button" onClick={() => addTodo(cat.categoryId)}>+</button>
                )}
                
              </div>

            {todos
              .filter(t => t.categoryId === cat.categoryId && t.date === selectedDate)
              .map(todo => (
                <div key={todo.todoId} className="todo-item">
                  <img src={todoCheck} className="todo-check-icon" alt="체크"/>

                  {editTodoId === todo.todoId ? (
                    <input
                      type="text"
                      value={todo.title}
                      placeholder="| 새 할 일 + Enter"
                      onChange={e => {
                        const value = e.target.value;
                        setTodos(prev =>
                          prev.map(td => td.todoId === todo.todoId ? {...td, title:value} : td)
                        );
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          if (todo.title.trim() === '') {
                            removeTodo(todo.todoId);
                          }
                          setEditTodoId(null);
                        }
                      }}
                      autoFocus
                    />
                  ):(
                    <span>{todo.title}</span>
                  )}

                  <div className="btn-group">
                    <button
                      className={`todo-status-btn success ${todo.status === 'DONE' ? 'active' : ''}`}
                      onClick={() => toggleTodoStatus(todo.todoId, 'DONE')}
                    >
                      달성
                    </button>
                    <button
                      className={`todo-status-btn fail ${todo.status === 'FAIL' ? 'active' : ''}`}
                      onClick={() => toggleTodoStatus(todo.todoId, 'FAIL')}
                    >
                      실패
                    </button>

                    <button
                      className="todo-dropdown-button"
                      ref={(el) => {dropdownButtonRefs.current[todo.todoId] = el; }}
                      onClick={() => handleTodoDropdownToggle(todo.todoId)}
                    >
                      <img src={ddd} className="todo-dropdown-button" alt="옵션" />
                    </button>
                  </div>
                </div>
              ))}             
            </div>
          ))}
        </div>
      </div>

      {/* 투두 드롭다운 */}
      {todoDropdownOpenId !== null && (
        <ul 
          className="todo-dropdown"
          style={{
            position: 'absolute',
            top: todoDropdownPosition.top -27,
            left: todoDropdownPosition.left + 25,
          }}
        >
            <li onClick={() => {
              setEditTodoId(todoDropdownOpenId);
              setTodoDropdownOpenId(null);
            }}>
              수정
            </li>
            <li onClick={() => {
              removeTodo(todoDropdownOpenId);
              setTodoDropdownOpenId(null);
            }}>
              삭제
            </li>
        </ul>
      )}

      {createModalOpen && (<CategoryCreateModal onClose={() => setCreateModalOpen(false)} />)}
      {manageModalOpen && (<CategoryManageModal onClose={() => setManageModalOpen(false)} />)}
      
    </div>
  );
};

export default TodoListPage;
