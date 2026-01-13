import React, { type FC } from 'react';
import './LoginAlertModal.css';
import Union from '../../assets/bookmark/Union.svg';

interface LoginAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginAlertModal: FC<LoginAlertModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="login-alert-modal-overlay" onClick={onClose}>
      <div
        className="login-alert-modal-content login-alert-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="login-alert-modal-header">
          <img src={Union} alt="물방울" className="login-modal-title-icon" />
          <h3>로그인 필요</h3>
        </div>

        <div className="login-alert-body">
          <p className="login-alert-text">
            로그인이 필요한 서비스입니다.
          </p>
        </div>

        <div className="login-alert-modal-buttons">
          <button className="login-alert-btn-cancel" onClick={onClose}>
            취소
          </button>
          <button className="alert-login" onClick={onLogin}>
            로그인하러 가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginAlertModal;