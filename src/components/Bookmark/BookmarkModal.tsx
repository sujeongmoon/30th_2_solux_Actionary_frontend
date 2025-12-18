import React, { useState } from 'react';
import './BookmarkModal.css';
import Union from '../../assets/bookmark/Union.svg';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, url: string) => void;
}

const BookmarkModal = ({ isOpen, onClose, onAdd }: BookmarkModalProps) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  // 이름이 있으면 URL 입력을 비활성화
  const isUrlDisabled = name.trim().length === 0;

  const handleSubmit = () => {
    if (!name.trim() || !url.trim()) {
      alert('이름과 URL을 모두 입력해주세요.');
      return;
    }
    onAdd(name, url);
    setName('');
    setUrl('');
    onClose();
  };

  const handleCancel = () => {
    setName('');
    setUrl('');
    onClose();
  }

  return (
    <div className="modal-root">
      {/* 배경 50% 어둡게 처리 */}
      <div className="modal-overlay" onClick={handleCancel} />
      
      <div className="modal-container">
        <div className="modal-header">
          <img src={Union} alt="북마크 추가 아이콘"></img> {/* 핑크색 아이콘 */}
          <div className='bookmark-title'>북마크 추가</div>
        </div>

        <div className="modal-content">
          <div className="input-field">
            <div className='modal-secname'>이름</div>
            <div className='input-wrapper'>
             <input
              type="text"
              placeholder="북마크 추가 이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            </div>
          </div>

          <div className="input-field">
            <div className='modal-secname'>URL</div>
            <div className = {`input-wrapper ${isUrlDisabled ? 'disabled' : 'active'}`}>
                <input
                title="북마크 추가 모달"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isUrlDisabled}
                placeholder={isUrlDisabled ? "" : "URL을 입력해주세요"}
            />     
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={handleCancel}>
            취소
          </button>
          <button className="btn-submit" onClick={handleSubmit}>
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkModal;