import React from 'react';
import './NotificationModal.css';
import Union from '../../assets/bookmark/Union.svg';

export interface NotificationItem {
  id: number;
  content: string;
  date: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, notifications }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="alert-modal-header">
          <h1>알림</h1>
        </header>

        <div className="alert-modal-body">
          {notifications.map((item) => (
            <div key={item.id} className="noti-card">
              <div className="noti-card-left">
                <img src={Union} alt='포인트 점' className="noti-point-dot"></img>
                <p className="noti-text">{item.content}</p>
              </div>
              <div className="noti-card-right">
                <span className="noti-date-text">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;