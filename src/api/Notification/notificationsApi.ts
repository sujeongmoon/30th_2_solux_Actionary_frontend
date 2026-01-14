import api from "../client"; // 이미 interceptor 적용된 axios 인스턴스 사용

export interface NotificationResponse {
  notificationId: number;
  type: string;
  title: string;
  content: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export interface GetNotificationsResult {
  success: boolean;
  message: string;
  data: NotificationResponse[];
}

export const getNotifications = async (limit?: number): Promise<NotificationResponse[]> => {
  const url = limit ? `/notifications?limit=${limit}` : '/notifications';
  const response = await api.get<GetNotificationsResult>(url); // 여기서 axios 인스턴스 사용
  if (!response.data.success) throw new Error(response.data.message || '알림 조회 실패');
  return response.data.data;
};
