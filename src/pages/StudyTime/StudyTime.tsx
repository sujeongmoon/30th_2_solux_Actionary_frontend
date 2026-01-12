import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './StudyTime.css';
import { getStudyTimeSvg } from '../../utils/studyTime';
import { getMonthlyStudyTime, type DailyStudyTime } from '../../api/studyTimeApi';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const StudyTime: React.FC = () => {
  const [value, setValue] = useState<Value>(new Date());
  const [studyData, setStudyData] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
    /* ================= MOCK DATA ================= */
  const mockStudyData: Record<string, number> = {
    '2026-01-01': 5400,
    '2026-01-02': 7200,
    '2026-01-03': 10800,
    '2026-01-04': 14400,
    '2026-01-05': 18000,
    '2026-01-06': 21600,
    '2026-01-07': 3600,
    '2026-01-09': 4500,
    '2026-01-10': 9000,
    '2026-01-11': 12600,
    '2026-01-12': 16200,
    '2026-01-13': 19800,
    '2026-01-14': 28800,
    '2026-01-20': 25200,
    '2026-01-28': 32400,
  };

  /* ================= UTIL ================= */
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h ? `${h}H` : ''}${m ? `${m}M` : ''}`;
  };

  const formatYearMonth = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`; // "2025-09"
  };

  /* ================= API ================= */
  useEffect(() => {
    const baseDate = value instanceof Date ? value : new Date();
    const yearMonth = formatYearMonth(baseDate);

    const fetchMonthlyData = async () => {
      setIsLoading(true);
      try {
        const data: DailyStudyTime[] = await getMonthlyStudyTime(yearMonth);
        
        // DailyStudyTime[] → Record<string, number> 변환
        const result: Record<string, number> = {};
        data.forEach((item) => {
          result[item.date] = item.durationSeconds;
        });
        
        setStudyData(result);
      } catch (error) {
        console.error('월간 공부 시간 조회 실패:', error);
        setStudyData(mockStudyData);
        //setStudyData({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthlyData();
  }, [value]);

  /* ================= RENDER ================= */
  return (
    <div className="study-container">
      <div className="calendar-card">
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner" />
          </div>
        )}
        <Calendar
          onChange={setValue}
          value={value}
          className='study-calendar'
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

            // date를 yyyy-mm-dd 형식으로 변환
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            const seconds = studyData[dateStr];

            if (!seconds) return null;

            return (
              <div className="badge-wrapper">
                <img
                  src={getStudyTimeSvg(seconds)}
                  alt={`${formatDuration(seconds)} 공부`}
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