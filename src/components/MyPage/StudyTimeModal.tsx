import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // 기본 스타일 import
import './StudyTimeModal.css'; // 커스텀 스타일 import

interface StudyTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudyTimeModal: React.FC<StudyTimeModalProps> = ({ isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // 이미지에 맞춰 select box로 구현하거나, 디자인된 input으로 구현
  const [hours, setHours] = useState<string>('00');
  const [minutes, setMinutes] = useState<string>('00');

  if (!isOpen) return null;

  const handleSave = () => {
    const dateStr = selectedDate.toISOString().slice(0, 10);
    console.log(`날짜: ${dateStr}, 시간: ${hours}시간 ${minutes}분 저장`);
    onClose();
  };

  // 시간/분 선택을 위한 옵션 생성 (예시)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="add-calendar-overlay">
      <div className="add-calendar-container">
        <div className="add-calendar-header">
          <span className="add-calendar-title-icon"></span>
          <h2 className="add-calendar-title">공부량 추가하기</h2>
        </div>

        {/* 1. 캘린더 섹션 (상단 배치) */}
        <div className="add-calendar-section">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            formatDay={(locale, date) => date.getDate().toString()} // '일' 제거하고 숫자만 표시
            className="add-custom-calendar"
            // 추가할 속성들
            prev2Label={null}  // << (이전 연도) 버튼 제거
            prevLabel="<"      // < (이전 달) 버튼 유지
            nextLabel=">"      // > (다음 달) 버튼 유지
            next2Label={null}    // >> (다음 연도) 버튼 유지 (필요 없으면 null로 변경 가능)
        />
        </div>

        {/* 2. 시간 입력 섹션 (하단 배치) */}
        <div className="time-input-section">
          <div className="time-input-group">
            <select value={hours} onChange={(e) => setHours(e.target.value)} className="time-select">
              {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="time-unit">H</span>
          </div>
          <div className="time-input-group">
            <select value={minutes} onChange={(e) => setMinutes(e.target.value)} className="time-select">
               {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="time-unit">M</span>
          </div>
        </div>

        {/* 3. 버튼 섹션 */}
        <div className="modal-button-group">
          <button className="modal-btn cancel-btn" onClick={onClose}>취소</button>
          <button className="modal-btn save-btn" onClick={handleSave}>추가하기</button>
        </div>
      </div>
    </div>
  );
};

export default StudyTimeModal;