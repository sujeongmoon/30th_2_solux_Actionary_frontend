import api from "../client";

/* ================== 타입 ================== */

export interface NotificationResponse {
  notificationId: number;
  type: string;
  title: string;
  content: string;
  link: string | null;   // ⭐ null 허용
  isRead: boolean;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* ================== 알림 목록 ================== */

export const getNotifications = async (): Promise<NotificationResponse[]> => {
  const res = await api.get<ApiResponse<NotificationResponse[]>>('/notifications');

  if (!res.data.success) {
    throw new Error(res.data.message || '알림 조회 실패');
  }

  return res.data.data;
};


/* ================== 읽음 처리 ================== */

export const markNotificationAsRead = async (
  notificationId: number
): Promise<NotificationResponse> => {
  console.log('[API] markNotificationAsRead', notificationId); // ⭐ 디버깅용

  const res = await api.patch<ApiResponse<NotificationResponse>>(
    `/notifications/${notificationId}/read`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || '알림 읽음 처리 실패');
  }

  return res.data.data;
};
