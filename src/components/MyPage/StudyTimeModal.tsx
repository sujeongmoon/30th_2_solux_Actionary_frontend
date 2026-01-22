import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './StudyTimeModal.css';
import Union from '../../assets/bookmark/Union.svg';
import { addStudyTimeManual } from '../../api/addStudyTime';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface StudyTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudyTimeModal: React.FC<StudyTimeModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');

  /** ======================
   *  공부시간 추가 mutation
   ====================== */
  const addStudyTimeMutation = useMutation({
    mutationFn: addStudyTimeManual,
    onSuccess: () => {
      // 🔥 공부시간 관련 쿼리 전부 갱신
      queryClient.invalidateQueries({
        queryKey: ['studyTime'],
      });

      onClose();
    },
    onError: () => {
      alert('공부량 추가에 실패했습니다.');
    },
  });

  if (!isOpen) return null;

  const handleSave = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      alert('오늘 이후 날짜는 선택할 수 없습니다.');
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
      return;
    }

    addStudyTimeMutation.mutate({
      date: dateStr,
      durationSecond,
    });
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  return (
    <div className="add-calendar-overlay">
      <div className="add-calendar-container">
        <div className="add-calendar-header">
          <img src={Union} alt="아이콘" className="add-calendar-title-icon" />
          <h2 className="add-calendar-title">공부량 추가하기</h2>
        </div>

        {/* 캘린더 */}
        <div className="add-calendar-section">
          <Calendar
            value={selectedDate}
            onChange={(value) => setSelectedDate(value as Date)}
            maxDate={new Date()}
            formatDay={(_, date) => date.getDate().toString()}
            className="add-custom-calendar"
            tileClassName={({ date }) =>
              date.toDateString() === selectedDate.toDateString()
                ? 'react-calendar__tile--active-custom'
                : ''
            }
            prev2Label={null}
            prevLabel="<"
            nextLabel=">"
            next2Label={null}
          />
        </div>

        {/* 시간 입력 */}
        <div className="time-input-section">
          <div className="time-input-group">
            <select
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="time-select"
            >
              {hourOptions.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span className="time-unit">H</span>
          </div>

          <div className="time-input-group">
            <select
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="time-select"
            >
              {minuteOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <span className="time-unit">M</span>
          </div>
        </div>

        {/* 버튼 */}
        <div className="add-modal-button-group">
          <button className="add-modal-btn cancel-btn" onClick={onClose}>
            취소
          </button>
          <button
            className="add-modal-btn save-btn"
            onClick={handleSave}
            disabled={addStudyTimeMutation.isPending}
          >
            {addStudyTimeMutation.isPending ? '저장 중...' : '추가하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyTimeModal;
