import React, { type FC } from 'react';
import './WithdrawModal.css'; // 별도 CSS 파일
import Union from '../../assets/bookmark/Union.svg';
import ACTIONARY from '../../assets/MyPage/ACTIONARY.svg';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: () => void;
}

const WithdrawModal: FC<WithdrawModalProps> = ({ isOpen, onClose, onWithdraw }) => {
  if (!isOpen) return null;

  return (
    <div className="wt-modal-overlay" onClick={onClose}>
      <div className="wt-modal-content withdraw-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wt-modal-header">
          <img src={Union} alt='물방울' className="modal-title-icon" />
          <h3>탈퇴하기</h3>
        </div>
        
        <div className="withdraw-body">
          <p className="withdraw-text">
            정말 <img src = {ACTIONARY} alt = '문구' className="wt-bold-white" /> 를 <span className="wt-highlight-red">탈퇴할까요?</span>
          </p>
        </div>

        <div className="wt-modal-buttons">
          <button className="wt-btn-cancel" onClick={onClose}>취소</button>
          <button className="btn-withdraw" onClick={onWithdraw}>탈퇴하기</button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;