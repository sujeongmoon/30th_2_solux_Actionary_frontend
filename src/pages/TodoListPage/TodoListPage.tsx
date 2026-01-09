import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'
import './TodoListPage.css'
import { useTodos } from '../../hooks/useTodos';
import { useTodoCategories } from '../../hooks/useTodoCategories';
import ddd from "../../assets/TodoList/ddd.svg";
import type { CreateTodoRequest } from '../../api/Todos/todosApi';

const TodoListPage: React.FC = () => {
  const { todos, loading, addTodo, editTodo, changeStatus, removeTodo } = useTodos();
  const { categories } = useTodoCategories();

  // 상태 관리
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [todoDropdownOpenId, setTodoDropdownOpenId] = useState<number | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayString);


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
            <li> 카테고리 등록</li>
            <li> 카테고리 관리</li>
          </ul>
        )}
        </div>
      </div>

      <div className="categories-list">
        {categories.map(cat => (
          <div key={cat.categoryId} className="category-block">
            <div className="category-header">
              <div className="category-name" style={{ backgroundColor: cat.color}}>
                {cat.name}
              </div>
              <button className="add-cat-button" onClick = {() => handleAddTodo(cat.categoryId)}>
                +
              </button>
            </div>

            <div className="todo-list">
              {todos.filter(todo => todo.categoryId === cat.categoryId).map(todo => (
                <div key={todo.todoId} className="todo-item">
                  {editingTodoId === todo.todoId ? (
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={() => handleEditTodo(todo.todoId)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditTodo(todo.todoId);
                      }}
                      autoFocus
                    />
                  ):(
                    <span
                      onClick={() => {
                        setEditingTodoId(todo.todoId);
                        setEditingText(todo.title);
                      }}
                    > {todo.title} </span>
                    )}

                    <div className="btn-group">
                      <button
                        className={`todo-status-btn success ${todo.status === 'DONE' ? 'active' : ''}`}
                        onClick={() => changeStatus(todo.todoId,'DONE')}
                      > 달성 </button>
                      <button
                        className={`todo-status-btn fail ${todo.status === 'FAILED' ? 'active' : ''}`}
                        onClick={() => changeStatus(todo.todoId, 'FAILED')}
                      >
                        실패
                      </button>

                      <button
                        className="todo-dropdown-button"
                        onClick={() =>
                          setTodoDropdownOpenId(prev => (prev === todo.todoId ? null : todo.todoId))
                        }
                      >
                        <img src={ddd} alt="dropdown" />
                      </button>
                      {todoDropdownOpenId === todo.todoId && (
                        <ul className="todo-dropdown">
                          <li onClick={() => {setEditingTodoId(todo.todoId); setEditingText(todo.title); }}>
                            수정
                          </li>
                          <li onClick={() => removeTodo(todo.todoId)}>삭제</li>
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {loading && <div className="loading"> 로딩중...</div>}
      </div>
    </div>
  );
};

export default TodoListPage;