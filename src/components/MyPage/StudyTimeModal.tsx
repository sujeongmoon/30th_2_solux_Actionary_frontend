import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // 기본 스타일 import
import './StudyTimeModal.css'; 
import Union from '../../assets/bookmark/Union.svg';
import { addStudyTimeManual } from '../../api/addStudyTime';


interface StudyTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudyTimeModal: React.FC<StudyTimeModalProps> = ({ isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hours, setHours] = useState<string>('00');
  const [minutes, setMinutes] = useState<string>('00');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async() => {
    if (isSaving) return;
    setIsSaving(true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
        alert('오늘 이후 날짜는 선택할 수 없습니다.');
        setIsSaving(false);
        return;
    }

    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const durationSecond = 
        Number(hours) * 3600 +
        Number(minutes) * 60;

    if (durationSecond === 0) {
        alert('공부 시간을 입력해주세요.');
        setIsSaving(false);
        return;
    }

    try {
        const res = await addStudyTimeManual({
            date: dateStr,
            durationSecond,
        });

        console.log('공부량 추가 성공:', res.data);
        onClose();
    } catch (error) {
        console.error('공부량 추가 실패', error);
        alert('공부량 추가에 실패했습니다.');
    } finally {
        setIsSaving(false);
    }
  };

  // 시간/분 선택을 위한 옵션 생성
  const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="add-calendar-overlay">
      <div className="add-calendar-container">
        <div className="add-calendar-header">
          <img src={Union} alt="이모지" className='add-calendar-title-icon'></img>
          <h2 className="add-calendar-title">공부량 추가하기</h2>
        </div>
        {/* 1. 캘린더 섹션 (상단 배치) */}
        <div className="add-calendar-section">
          <Calendar
            value={selectedDate}
            onChange={(value) => setSelectedDate(value as Date)}
            maxDate={new Date()}
            formatDay={(locale, date) => date.getDate().toString()} // '일' 제거하고 숫자만 표시
            className="add-custom-calendar"
            tileClassName={({ date }) =>
              date.toDateString() === selectedDate.toDateString()
                ? 'react-calendar__tile--active-custom'
                : ''
            }
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
            <select value={hours} onChange={(e) => setHours(e.target.value)} className="time-select" title="시간 설정">
              {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="time-unit">H</span>
          </div>
          <div className="time-input-group">
            <select value={minutes} onChange={(e) => setMinutes(e.target.value)} className="time-select" title="분 설정">
               {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="time-unit">M</span>
          </div>
        </div>

        {/* 3. 버튼 섹션 */}
        <div className="add-modal-button-group">
          <button className="add-modal-btn cancel-btn" onClick={onClose}>취소</button>
          <button className="add-modal-btn save-btn" onClick={handleSave}>추가하기</button>
        </div>
      </div>
    </div>
  );
};

export default StudyTimeModal;