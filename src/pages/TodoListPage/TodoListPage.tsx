import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './TodoListPage.css';
import TodoCalendar from '../../components/TodoList/TodoCalendar';
import ddd from "../../assets/TodoList/ddd.svg";
import todoCheck from "../../assets/TodoList/todoCheck.svg";
import { useTodoCategoriesContext } from '../../context/TodoCategoriesContext';
import { useTodos } from '../../hooks/useTodos';
import { updateTodo, type Todo } from '../../api/Todos/todosApi';

// 모달 컴포넌트
import CategoryCreateModal from '../../components/TodoList/CategoryCreateModal';
import CategoryManageModal from '../../components/TodoList/CategoryManageModal';
import CategoryEditModal from '../../components/TodoList/CategoryEditModal';
import { ReactMarkView } from '@tiptap/react';




interface Category {
  categoryId: number;
  name: string;
  color: string;
}

interface TodoDropdownPosition {
  top: number;
  left: number;
}

const TodoListPage: React.FC = () => {
  const { todos, selectedDate, setSelectedDate, addTodoItem, editTodo, removeTodo, changeStatus, } = useTodos();
  /* 상태
  const today = new Date();
  const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  const [selectedDate, setSelectedDate] = useState(todayString); */

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTodoId, setEditTodoId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isNewTodo, setIsNewTodo] = useState(false); //새 투두 여부

  const [todoDropdownOpenId, setTodoDropdownOpenId] = useState<number | null>(null);
  const [todoDropdownPosition, setTodoDropdownPosition] = useState<TodoDropdownPosition>({ top: 0, left: 0 });
  const dropdownButtonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  // 카테고리 드롭다운 위치 계산
  const categoryButtonRef = useRef<HTMLButtonElement | null>(null);
  const [categoryDropdownPosition, setCategoryDropdownPosition] = useState({
    top: 0,
    left: 0,
  });

  const { categories } = useTodoCategoriesContext();
  const visibleCategories = categories.filter(cat => {
    const createdUTC = new Date(cat.createdAt);
    const createdKST = new Date(createdUTC.getTime() + 9 * 60 * 60 * 1000);
    createdKST.setHours(0,0,0,0);

    const selected = new Date(selectedDate);
    selected.setHours(0,0,0,0);

    return selected >= createdKST;
  });
  const isSameDate = (a: string, b: string) => {
    const da = new Date(a);
    const db = new Date(b);
    da.setHours(0,0,0,0);
    db.setHours(0,0,0,0);
    return da.getTime() === db.getTime();
  };

  const handleAddTodo = async (categoryId: number) => {
    try {
      const newTodo = await addTodoItem(categoryId);
      console.log(newTodo);
      setEditTodoId(newTodo.todoId);
      setEditingTitle('');
    } catch (err) {
      console.error("새 투두 추가 실패", err);
    }
  };

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
            ref={categoryButtonRef}
              className="category-dropdown-button"
              onClick={() => {
                const rect = categoryButtonRef.current!.getBoundingClientRect();
                setCategoryDropdownPosition({
                  top: rect.bottom + window.scrollY,
                  left: rect.left + window.scrollX,
                });
                setCategoryDropdownOpen(v => !v);
              }}
            >
              <img src={ddd} alt="카테고리 옵션"/>
            </button>

          </div>

          {visibleCategories.map(cat => (
            <div key={cat.categoryId} className="category-block">
              <div className="category-header">
                <div
                  className="category-name"
                  style={{borderColor: cat.color, color: cat.color}}
                >
                  {cat.name}
                </div>

                <button className="add-cat-button" onClick={() => handleAddTodo(cat.categoryId)}>+</button>
              
              </div>

            {todos
              .filter(t => t.categoryId === cat.categoryId && isSameDate(t.date, selectedDate))
              .map(todo => (
                <div key={todo.todoId} className="todo-item">
                  <img src={todoCheck} className="todo-check-icon" alt="체크"/>

                  {editTodoId === todo.todoId ? (
                    <input
                      type="text"
                      value={editingTitle}
                      placeholder="| 새 할 일 + Enter"
                      onChange={e => setEditingTitle(e.target.value)}
                      onKeyDown={async e => {
                        if (e.key === 'Enter') {
                          const trimmed = editingTitle.trim();
                          if (trimmed !== '') {
                            await editTodo(todo.todoId, { title: trimmed });
                          }
                          setEditingTitle('');
                          setIsNewTodo(false);
                          setEditTodoId(null);
                        }
                      }}
                      autoFocus
                    />
                  ):(
                    <span
                      onClick={() => {
                        setEditTodoId(todo.todoId);
                        setEditingTitle(todo.title);
                      }}
                    >{todo.title || "새 할 일"}</span>
                  )}

                  <div className="btn-group">
                    <button
                      className={`todo-status-btn success ${todo.status === 'DONE' ? 'active' : ''}`}
                      onClick={() => changeStatus(todo.todoId, 'DONE')}
                    >
                      달성
                    </button>
                    <button
                      className={`todo-status-btn fail ${todo.status === 'FAILED' ? 'active' : ''}`}
                      onClick={() => changeStatus(todo.todoId, 'FAILED')}
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
              const todo = todos.find(t => t.todoId === todoDropdownOpenId);
              if (todo) setEditingTitle(todo.title);
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

      {categoryDropdownOpen && 
        ReactDOM.createPortal(
          <ul 
            className="category-dropdown"
            style={{
                position: 'absolute',
                top: categoryDropdownPosition.top,
                left: categoryDropdownPosition.left,
            }}
          >
            <li onClick={() => {
              setCreateModalOpen(true);
              setCategoryDropdownOpen(false);
            }}>카테고리 등록</li>
            <li onClick={() => {
              setManageModalOpen(true);
              setCategoryDropdownOpen(false);
            }}>카테고리 관리</li>
          </ul>,
          document.body
        )
      }

      {createModalOpen && (<CategoryCreateModal onClose={() => setCreateModalOpen(false)} />)}
      {manageModalOpen && (<CategoryManageModal onClose={() => setManageModalOpen(false)} />)}
      
    </div>
  );
};

export default TodoListPage;