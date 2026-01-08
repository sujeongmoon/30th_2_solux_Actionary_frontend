import React, { type FC } from 'react';
import './NickNameModal.css';
import Union from '../../assets/bookmark/Union.svg';

interface NickNameModalProps {
  isOpen: boolean;
  initialValue: string;
  onClose: () => void;
  onSave: (value: string) => void;
}

const NickNameModal: FC<NickNameModalProps> = ({ isOpen, onClose, onSave }) => {
  const [input, setInput] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
        setInput('');
    }
}, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="nk-modal-overlay" onClick={onClose}>
      {/* stopPropagation을 통해 모달 내부 클릭 시 닫히지 않게 설정 */}
      <div className="nk-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="nk-modal-header">
          <img src={Union} alt='물방울 무늬' className="nk-modal-title-icon"></img> {/* 빨간 물방울 아이콘 부분 */}
          <h3>닉네임 수정</h3>
        </div>
        
        <div className="nk-modal-input-group">
          <label>새 닉네임</label>
          <input
            autoFocus
            className={`nickname-input ${input ? 'filled' : ''}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="닉네임을 입력하세요"
          />
        </div>

        <div className="nk-modal-buttons">
          <button className="nk-btn-cancel" onClick={onClose}>취소</button>
          <button className="nk-btn-save" onClick={() => onSave(input)}>수정하기</button>
        </div>
      </div>
    </div>
  );
};

export default NickNameModal;