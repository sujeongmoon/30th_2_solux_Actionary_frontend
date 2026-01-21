import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './TodoCalendar.css';
import type { Todo } from '../../api/Todos/todosApi';
import icona from '../../assets/TodoList/icona.svg';
import iconb from '../../assets/TodoList/iconb.svg';
import iconc from '../../assets/TodoList/iconc.svg';
import icond from '../../assets/TodoList/icond.svg';
import icone from '../../assets/TodoList/icone.svg';

interface TodoCalendarProps {
  selectedDate: string;
  onChangeDate: (date: string) => void;
  //todoMap: Record<string, { status: 'PENDING' | 'DONE' | 'FAILED' }[]>;
  calendarMap: Record<string, Todo[]>;
}

const pad = (n: number) => String(n).padStart(2, '0');

const parseDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const TodoCalendar: React.FC<TodoCalendarProps> = ({
  selectedDate,
  onChangeDate,
  calendarMap,
}) => {
  const [activeMonth, setActiveMonth] = useState(parseDate(selectedDate));
  const [view, setView] =
    useState<'month' | 'year' | 'decade' | 'century'>('month');

  const handleChange = (value: any) => {
    if (!value || Array.isArray(value)) return;
    onChangeDate(
      `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(
        value.getDate()
      )}`
    );
  };

  const movePrev = () => {
    if (view === 'month') {
      setActiveMonth(
        new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1)
      );
    } else if (view === 'year') {
      setActiveMonth(new Date(activeMonth.getFullYear() - 1, 0, 1));
    } else if (view === 'decade') {
      setActiveMonth(new Date(activeMonth.getFullYear() - 10, 0, 1));
    }
  };

  const moveNext = () => {
    if (view === 'month') {
      setActiveMonth(
        new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1)
      );
    } else if (view === 'year') {
      setActiveMonth(new Date(activeMonth.getFullYear() + 1, 0, 1));
    } else if (view === 'decade') {
      setActiveMonth(new Date(activeMonth.getFullYear() + 10, 0, 1));
    }
  };

  return (
    <div className="todo-calendar-container">
      {/* 커스텀 헤더 */}
      <div className="todo-calendar-header">
        <span
          onClick={() => {
            if (view === 'month') setView('year');
            else if (view === 'year') setView('decade');
            else setView('month');
          }}
          style={{ cursor: 'pointer' }}
        >
          {view === 'month' &&
            `${activeMonth.getMonth() + 1}월 ${activeMonth.getFullYear()}`}
          {view === 'year' && `${activeMonth.getFullYear()}년`}
          {view === 'decade' &&
            `${Math.floor(activeMonth.getFullYear() / 10) * 10} - ${
              Math.floor(activeMonth.getFullYear() / 10) * 10 + 9
            }`}
        </span>

        <div className="calendar-nav">
          <button onClick={movePrev}>&lt;</button>
          <button onClick={moveNext}>&gt;</button>
        </div>
      </div>

      <Calendar
        className="todo-calendar"
        value={parseDate(selectedDate)}
        onChange={handleChange}
        view={view}
        onViewChange={({ view }) => setView(view)}
        activeStartDate={activeMonth}
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

          const dateStr = `${date.getFullYear()}-${pad(
            date.getMonth() + 1
          )}-${pad(date.getDate())}`;

          const dayTodos = calendarMap[dateStr] ?? [];

          if (dayTodos.length === 0) return null;

          const doneCount = dayTodos.filter(t => t.status === 'DONE').length;
          const ratio = doneCount / dayTodos.length;

         /* let icon =
            'https://actionary-s3-bucket-v2.s3.ap-northeast-2.amazonaws.com/static/study_time_calendar/under2.png';
          if (ratio >= 0.9)
            icon =
              'https://actionary-s3-bucket-v2.s3.ap-northeast-2.amazonaws.com/static/study_time_calendar/over8.png';
          else if (ratio >= 0.6)
            icon =
              'https://actionary-s3-bucket-v2.s3.ap-northeast-2.amazonaws.com/static/study_time_calendar/over6.png';
          else if (ratio >= 0.4)
            icon =
              'https://actionary-s3-bucket-v2.s3.ap-northeast-2.amazonaws.com/static/study_time_calendar/over4.png';
          else if (ratio >= 0.2)
            icon =
              'https://actionary-s3-bucket-v2.s3.ap-northeast-2.amazonaws.com/static/study_time_calendar/over2.png'; */
          let icon = icona;
          if (ratio >= 0.8) icon = icone;
          else if (ratio >= 0.6) icon = icond;
          else if (ratio >= 0.4) icon = iconc;
          else if (ratio >= 0.2) icon = iconb;
            

          return (
            <div className="todo-calendar-completion-icon">
              <img src={icon} alt="완료 아이콘" />
              <span>{doneCount}</span>
            </div>
          );
        }}
      />
    </div>
  );
};

export default TodoCalendar;
