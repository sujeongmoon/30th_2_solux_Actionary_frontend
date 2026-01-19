import React from 'react';
import './NotificationModal.css';
import Union from '../../assets/bookmark/Union.svg';
import { useNavigate } from 'react-router-dom';
import {
  markNotificationAsRead,
} from '../../api/Notification/notificationsApi';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onUpdateNotification: (updated: NotificationItem) => void;
}
// NotificationModal.tsx (또는 별도 types 파일)
export interface NotificationItem {
  notificationId: number;
  type: string;
  title: string;
  content: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}


const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onUpdateNotification
}) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleClick = async (item: NotificationItem) => {
  console.log('알림 클릭', item.notificationId); // 디버깅

  // 1️⃣ 읽음 처리
  if (!item.isRead) {
    try {
      const updated = await markNotificationAsRead(item.notificationId);

      // API 응답 → UI 타입으로 변환
      const updatedItem: NotificationItem = {
        notificationId: updated.notificationId,
        type: updated.type,
        title: updated.title,
        content: updated.content,
        link: updated.link,
        isRead: updated.isRead,
        createdAt: updated.createdAt
      };

      onUpdateNotification(updatedItem);
    } catch (e) {
      console.error('알림 읽음 처리 실패', e);
    }
  }

  // 2️⃣ link 있을 때만 이동
  if (item.link) {
    navigate(item.link);
    onClose();
  }
};


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="alert-modal-header">
          <h1>알림</h1>
        </header>

        <div className="alert-modal-body">
          {notifications.map((item) => (
            <div
              key={item.notificationId}
              className={`noti-card ${item.isRead ? 'read' : 'unread'}`}
              onClick={() => handleClick(item)}
            >
              <div className="noti-card-left">
                <img src={Union} alt="점" className="noti-point-dot" />
                <div className="noti-text">
                  <p className="noti-title">{item.title}</p>
                  <p className="noti-content">{item.content}</p>
                </div>
              </div>

              <div className="noti-card-right">
                <span className="noti-date-text">
                  {new Date(item.createdAt)
                    .toLocaleDateString('ko-KR')
                    .replace(/\./g, '/')
                    .replace(/\/$/, '')
                    .replace(/\s/g, '')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
