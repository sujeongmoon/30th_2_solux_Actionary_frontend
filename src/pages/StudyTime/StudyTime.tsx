import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './StudyTime.css';
import { getStudyTimeSvg } from '../../utils/studyTime';
import { getDailyStudyTime } from '../../api/studyTimeApi';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const StudyTime: React.FC = () => {
  const [value, setValue] = useState<Value>(new Date());
  const [apiStudyData, setApiStudyData] = useState<Record<string, number>>({});

  /* ================= MOCK DATA ================= */
  const mockStudyData: Record<string, number> = {
    '2025-09-01': 5400,
    '2025-09-02': 7200,
    '2025-09-03': 10800,
    '2025-09-04': 14400,
    '2025-09-05': 18000,
    '2025-09-06': 21600,
    '2025-09-07': 3600,
    '2025-09-09': 4500,
    '2025-09-10': 9000,
    '2025-09-11': 12600,
    '2025-09-12': 16200,
    '2025-09-13': 19800,
    '2025-09-14': 28800,
    '2025-09-20': 25200,
    '2025-09-28': 32400,
  };

  /* ================= UTIL ================= */
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h ? `${h}H` : ''}${m ? `${m}M` : ''}`;
  };

  const getMonthDates = (year: number, month: number) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) =>
      new Date(year, month, i + 1).toLocaleDateString('sv-SE')
    );
  };

  /* ================= API ================= */
  useEffect(() => {
    const baseDate = value instanceof Date ? value : new Date();
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    const fetchMonthlyStudyTime = async () => {
      const dates = getMonthDates(year, month);
      const result: Record<string, number> = {};

      await Promise.all(
        dates.map(async (date) => {
          try {
            const seconds = await getDailyStudyTime(date); // ✅ number
            result[date] = seconds;
          } catch {
            result[date] = 0;
          }
        })
      );

      setApiStudyData(result);
    };

    fetchMonthlyStudyTime();
  }, [value]);

  /* ================= RENDER ================= */
  return (
    <div className="study-container">
      <div className="calendar-card">
        <Calendar
          onChange={setValue}
          value={value}
          formatDay={(_, date) => date.getDate().toString()}
          formatShortWeekday={(_, date) =>
            ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
          }
          navigationLabel={({ date }) =>
            `${date.getMonth() + 1}월 ${date.getFullYear()}`
          }
          next2Label={null}
          prev2Label={null}
          showNeighboringMonth={false}
          calendarType="gregory"
          tileContent={({ date, view }) => {
            if (view !== 'month') return null;

            const dateStr = date.toLocaleDateString('sv-SE');
            const seconds =
              apiStudyData[dateStr] ?? mockStudyData[dateStr];

            if (!seconds) return null;

            return (
              <div className="badge-wrapper">
                <img
                  src={getStudyTimeSvg(seconds)}
                  alt="공부량"
                  className="study-drop-icon"
                />
                <span className="duration-text">
                  {formatDuration(seconds)}
                </span>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default StudyTime;
