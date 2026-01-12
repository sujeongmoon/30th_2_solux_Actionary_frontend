import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './TodoCalendar.css';

import icona from "../../assets/TodoList/icona.svg";
import iconb from "../../assets/TodoList/iconb.svg";
import iconc from "../../assets/TodoList/iconc.svg";
import icond from "../../assets/TodoList/icond.svg";
import icone from "../../assets/TodoList/icone.svg";

interface Todo {
  date: string;
  status: string;
}

interface TodoCalendarProps {
  selectedDate: string;
  onChangeDate: (date: string) => void;
  todos: Todo[];
}

const TodoCalendar: React.FC<TodoCalendarProps> = ({
  selectedDate,
  onChangeDate,
  todos,
}) => {
  const [activeMonth, setActiveMonth] = useState(new Date(selectedDate));

  // 날짜 변경
  const handleChange = (value: any) => {
    if (!value || Array.isArray(value)) return;
    onChangeDate(
      `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`
    );
  };

  return (
    <div className="todo-calendar-container">
      {/* 커스텀 헤더 */}
      <div className="todo-calendar-header">
        <span>
          {activeMonth.getMonth() + 1}월 {activeMonth.getFullYear()}
        </span>

        <div className="calendar-nav">
          <button
            onClick={() =>
              setActiveMonth(
                new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1)
              )
            }
          >
            &lt;
          </button>
          <button
            onClick={() =>
              setActiveMonth(
                new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1)
              )
            }
          >
            &gt;
          </button>
        </div>
      </div>

      <Calendar
        className="todo-calendar"
        value={new Date(selectedDate)}
        onChange={handleChange}
        locale="ko-KR"
        calendarType="gregory"
        showNavigation={false}
        showNeighboringMonth={false}
        formatDay={(_, date) => String(date.getDate())}
        onActiveStartDateChange={({ activeStartDate }) => {
          if (activeStartDate) setActiveMonth(activeStartDate);
        }}
        tileContent={({ date, view }) => {
          if (view !== 'month') return null;

          const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
          const dayTodos = todos.filter(t => t.date === dateStr);

          // 투두가 없으면 아이콘 안 보이게
          if (dayTodos.length === 0) return null;

          const doneCount = dayTodos.filter(t => t.status === 'DONE').length;
          const totalCount = dayTodos.length;
          const ratio = totalCount > 0 ? doneCount / totalCount : 0;

          let icon = icona;
          if (ratio >= 0.9) icon = icone;
          else if (ratio >= 0.6) icon = icond;
          else if (ratio >= 0.4) icon = iconc;
          else if (ratio >= 0.2) icon = iconb;

          return (
            <div className="todo-calendar-completion-icon">
              <img src={icon} alt="완료 아이콘"/>
              <span>{doneCount}</span>
            </div>
          );
        }}
      />
    </div>
  );
};

export default TodoCalendar;
