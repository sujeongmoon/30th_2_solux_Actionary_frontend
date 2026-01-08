import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'
import './TodoListPage.css'
import { useTodos } from '../../hooks/useTodos';
import { useTodoCategories } from '../../hooks/useTodoCategories';
import ddd from "../../assets/TodoList/ddd.svg";
import type { CreateTodoRequest, Todo } from '../../api/Todos/todosApi';

const TodoListPage: React.FC = () => {
  const { selectedDate, setSelectedDate, todos, loading, addTodo, editTodo, changeStatus, removeTodo, toggleRoutine} = useTodos();
  const { categories } = useTodoCategories();

  // 상태 관리
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [todoDropdownOpenId, setTodoDropdownOpenId] = useState<number | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");


  // 날짜 클릭
  const handleDateChange = (value: any) => {
    let date: Date;
    if (Array.isArray(value)) {
      if (!value[0]) return;
      date = value[0];
    } else {
      if (!value) return;
      date = value;
    }
    setSelectedDate(date.toISOString().split("T")[0]);
  };
  

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
        />
    </div>

    <div className="todo-container">
      <div className="todo-header">
        <span>{selectedDate}</span>
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
                        className={`status-btn success ${todo.status === 'DONE' ? 'active' : ''}`}
                        onClick={() => changeStatus(todo.todoId,'DONE')}
                      > 달성 </button>
                      <button
                        className={`status-btn fail ${todo.status === 'FAILED' ? 'active' : ''}`}
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
                          <li onClick={() => toggleRoutine(todo)}>
                            {todo.routineId ? "루틴 해제" : "루틴 생성"}
                          </li>
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