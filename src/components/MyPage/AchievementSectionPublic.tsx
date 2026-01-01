import React, { useEffect, useState } from 'react';
import Union from '../../assets/MyPage/Union.svg';
import StudyTime from '../../assets/MyPage/StudyTime.svg';
import StudyIcon from '../../assets/MyPage/StudyIcon.svg';
import CheckIcon from '../../assets/MyPage/CheckIcon.svg';
import OwnerUnion from '../../assets/MyPage/OwnerUnion.svg';
import './AchievementSection.css';

interface Points {
  study: number;
  studyParticipation: number;
  todo: number;
  total: number;
}

interface Badge {
  badge_id: number;
  badge_name: string;
  badge_image_url: string;
}

interface AchievementSectionProps {
  nickname?: string; // 🔹 없으면 내 업적, 있으면 상대방 업적
}

/* MOCK DATA */
const MOCK_POINTS = {
  study: 100,
  studyParticipation: 30,
  todo: 2,
  total: 132,
};

const MOCK_BADGE = {
  badge_id: 1,
  badge_name: '10P',
  badge_image_url: 'https://i.pravatar.cc/150?img=3',
};

const AchievementSection: React.FC<AchievementSectionProps> = ({ nickname }) => {
  const [points, setPoints] = useState<Points>({
    study: 0,
    studyParticipation: 0,
    todo: 0,
    total: 0,
  });

  const [badge, setBadge] = useState<Badge>({
    badge_id: 0,
    badge_name: '',
    badge_image_url: '',
  });

  /* =========================
     🔹 포인트 조회
     ========================= */
  useEffect(() => {
    // MOCK
    setPoints(MOCK_POINTS);

    /*
    const fetchPoints = async () => {
      try {
        const url = nickname
          ? `/api/users/nickname/${nickname}/points`
          : `/api/users/me/points`;

        const res = await fetch(url);
        const result = await res.json();

        setPoints(result.data);
      } catch (error) {
        console.error('포인트 조회 실패', error);
      }
    };

    fetchPoints();
    */
  }, [nickname]);

  /* =========================
     🔹 배지 조회
     ========================= */
  useEffect(() => {
    // MOCK
    setBadge(MOCK_BADGE);

    /*
    const fetchBadge = async () => {
      try {
        const url = nickname
          ? `/api/users/nickname/${nickname}/badge`
          : `/api/users/me/badge`;

        const res = await fetch(url);
        const result = await res.json();

        setBadge(result.data);
      } catch (error) {
        console.error('배지 조회 실패', error);
      }
    };

    fetchBadge();
    */
  }, [nickname]);

  return (
    <div className='owner-achievement-section'>
      <div className='owner-achievement-header'>
        <img src={Union} alt='제목' className='owner-achievement-dot' />
        <span className='owner-achievement-title'>
          {`${nickname}님의 업적`}
        </span>
      </div>

      <div className='owner-stats-box'>
        {/* 배지 */}
        <div className='owner-badge-card'>
          {badge.badge_image_url && (
            <img
              src={badge.badge_image_url}
              alt={badge.badge_name}
              className='owner-badge-image'
            />
          )}
          <span className='owner-badge-text'>
            {badge.badge_name && `${badge.badge_name} 달성`}
          </span>
        </div>

        {/* 상세 포인트 */}
        <div className='owner-stat-white-box'>
          <div className='owner-stats-list'>
            <div className='owner-stat-pill'>
              <div className='owner-stat-label'>
                <img src={StudyTime} alt='공부시간' />
                <span>공부시간</span>
              </div>
              <span className='owner-stat-value'>{points.study}P</span>
            </div>

            <div className='owner-stat-pill'>
              <div className='owner-stat-label'>
                <img src={StudyIcon} alt='스터디' />
                <span>스터디</span>
              </div>
              <span className='owner-stat-value'>
                {points.studyParticipation}P
              </span>
            </div>

            <div className='owner-stat-pill'>
              <div className='owner-stat-label'>
                <img src={CheckIcon} alt='투두' />
                <span>투두리스트</span>
              </div>
              <span className='owner-stat-value'>{points.todo}P</span>
            </div>
          </div>

          {/* 총 포인트 */}
          <div className='owner-total-points'>
            <div className='owner-total-label'>
              <img src={OwnerUnion} alt='그라데이션' />
              <span>총 포인트</span>
            </div>
            <span className='owner-total-value'>{points.total}P</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementSection;
