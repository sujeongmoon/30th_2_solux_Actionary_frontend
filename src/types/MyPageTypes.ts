
export type TabKey = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
export type TodoStatus = 'PENDING' | 'DONE' | 'FAILED';
export type TodoUpdateStatus = Exclude<TodoStatus, 'PENDING'>;

export interface TodoItem {
  todoId: number;
  title: string;
  categoryId: number;
  status: TodoStatus;
}

/* 특정 날짜 투두 조회 응답 */
export interface GetTodosByDateResponse {
  success: boolean;
  message: string;
  data: {
    date: string;       
    todos: TodoItem[];
  };
}

export interface TodoCategory {
  categoryId: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface GetTodoCategoriesResponse {
    success: boolean;
    message: string;
    data: TodoCategory[];
}

/* =========================
 * 공부량(Study Time) 관련
 * ========================= */
export interface StudyTimeData {
  period: TabKey;
  date: string;            // YYYY-MM-DD
  durationSeconds: number; // 초 단위
}

export interface GetStudyTimeResponse {
  success: boolean;
  message: string;
  data: StudyTimeData;
}


/* 탭별 공부량 표시용 */
export type StudyTimeState = Record<TabKey, string>;
