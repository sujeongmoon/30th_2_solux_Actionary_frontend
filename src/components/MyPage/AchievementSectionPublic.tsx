import React, { useEffect, useState } from 'react';
import Union from '../../assets/MyPage/Union.svg';
import StudyTime from '../../assets/MyPage/StudyTime.svg';
import StudyIcon from '../../assets/MyPage/StudyIcon.svg';
import CheckIcon from '../../assets/MyPage/CheckIcon.svg';
import OwnerUnion from '../../assets/MyPage/OwnerUnion.svg';
import { api } from '../../api/client';
import './AchievementSection.css';

interface Points {
  study: number;
  studyParticipation: number;
  todo: number;
  total: number;
}

interface Badge {
  id: number;
  name: string;
  requiredPoint: number;
  imageUrl: string;
}

interface AchievementSectionPublicProps {
  memberId: number;
  nickname: string;
}

const AchievementSectionPublic: React.FC<AchievementSectionPublicProps> = ({
  memberId,
  nickname,
}) => {
  const [points, setPoints] = useState<Points>({
    study: 0,
    studyParticipation: 0,
    todo: 0,
    total: 0,
  });
  const [badge, setBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievementData = async () => {
      try {
        const [pointsRes, badgeRes] = await Promise.all([
          api.get(`/users/${memberId}/points`),
          api.get(`/members/${memberId}/badge`),
        ]);

        setPoints(pointsRes.data.data.points);
        setBadge(badgeRes.data.data);
      } catch (err) {
        console.error('타인 업적 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievementData();
  }, [memberId]);

  if (loading) return <div>업적 로딩중...</div>;

  return (
    <div className='owner-achievement-section'>
      <div className='owner-achievement-header'>
        <img src={Union} alt="제목" className='owner-achievement-dot' />
        <span className='owner-achievement-title'>
          {nickname}님의 업적
        </span>
      </div>

      <div className='owner-stats-box'>
        <div className='owner-badge-card'>
          {badge && badge.imageUrl && (
            <img src={badge.imageUrl} alt={badge.name} className='owner-badge-image' />
          )}
          <span className='owner-badge-text'>
            {badge ? `${badge.name} 달성` : ''}
          </span>
        </div>

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
              <span className='owner-stat-value'>{points.studyParticipation}P</span>
            </div>

            <div className='owner-stat-pill'>
              <div className='owner-stat-label'>
                <img src={CheckIcon} alt='투두리스트' />
                <span>투두리스트</span>
              </div>
              <span className='owner-stat-value'>{points.todo}P</span>
            </div>
          </div>

          <div className='owner-total-points'>
            <div className='owner-total-label'>
              <img src={OwnerUnion} alt='총 포인트' />
              <span>총 포인트</span>
            </div>
            <span className='owner-total-value'>{points.total}P</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementSectionPublic;
