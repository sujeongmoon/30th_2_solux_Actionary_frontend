import { useEffect, useState } from 'react';
import { getMonthlyCalendarSummary } from '../api/Todos/todosApi';
import type { MonthlyCalendarSummary } from '../api/Todos/todosApi';

export const useMonthlyCalendarSummary = (year: number, month: number) => {
  const [summaryMap, setSummaryMap] = useState<Record<string, MonthlyCalendarSummary>>({});
  const [doneMap, setDoneMap] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);

    getMonthlyCalendarSummary(year, month)
      .then(data => {
        /*const map: Record<string, MonthlyCalendarSummary> = {};
        data.forEach(item => {
          map[item.date] = item;
        });*/
        const summary: Record<string, MonthlyCalendarSummary> = {};
        const done: Record<string, number> = {};
        
        data.forEach(item => {
          summary[item.date] = item;
          done[item.date] = item.doneCount;
        });
        setSummaryMap(summary);
        setDoneMap(done);
      })
      .finally(() => setIsLoading(false));
  }, [year, month]);

  return { summaryMap, doneMap, isLoading };
};