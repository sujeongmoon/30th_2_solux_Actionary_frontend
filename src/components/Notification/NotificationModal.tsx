import React from 'react';
import './NotificationModal.css';
import Union from '../../assets/bookmark/Union.svg';
import { useNavigate } from 'react-router-dom';

export interface NotificationItem {
  notificationId: number;
  type: string;
  title: string;
  content: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, notifications }) => {
    const navigate = useNavigate();
    if (!isOpen) return null;
    // NotificationModal 컴포넌트 안에 추가
    console.log('notifications:', notifications);
    const handleClick = (link?: string) => {
        if (!link) return;
        navigate(link);
        onClose();
    }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="alert-modal-header">
          <h1>알림</h1>
        </header>

        <div className="alert-modal-body">
          {notifications.map((item) => (
            <div key={item.notificationId} className={`noti-card ${item.isRead ? 'read' : 'unread'}`}
                 onClick={() => handleClick(item.link)}>
              <div className="noti-card-left">
                <img src={Union} alt='포인트 점' className="noti-point-dot"></img>
                <div className='noti-text'>
                  <p className="noti-title">{item.title}</p>
                  <p className='noti-content'>{item.content}</p>
                </div>
              </div>
              <div className="noti-card-right">
                <span className="noti-date-text">{
                    new Date(item.createdAt).toLocaleDateString('ko-KR').replace(/\./g, '/').replace(/\/$/, '').replace(/\s/g, '')}</span>
              </div>
            </div>
          ))}
          
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;