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
    memberId?: number;
    name: string;
    requiredPoint: number;
    imageUrl: string;
}


const AchievementSection: React.FC = () => {
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
      console.log("--- 데이터 호출 시작 ---");
      try {
        const meRes = await api.get('/members/me/info');
        console.log("1. 내 정보 응답:", meRes.data);

        const memberId = meRes.data.data?.memberId || meRes.data.memberId;
        console.log("2. 확인된 memberId:", memberId);

        if (!memberId) {
          console.error("3. 실패: memberId를 찾을 수 없어 중단합니다.");
          return;
        }

        console.log("4. 다음 요청 시작 (points, badge)");
        const [pointsRes, badgeRes] = await Promise.all([
          api.get(`/users/${memberId}/points`),
          api.get(`/members/${memberId}/badge`)
        ]);

        console.log("5. 포인트 응답:", pointsRes.data);
        console.log("6. 배지 응답:", badgeRes.data);

        setPoints(pointsRes.data.data.points);
        setBadge(badgeRes.data.data);
      } catch (err) {
        console.error('!!! 에러 발생:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievementData();
  }, []);

  if (loading) return <div>업적 로딩중...</div>;


    return (
        <div className='owner-achievement-section'>
            <div className='owner-achievement-header'>
                <img src={Union} alt="제목" className='owner-achievement-dot'/>
                <span className='owner-achievement-title'>
                    현재 나의 업적
                </span>
            </div>

            <div className='owner-stats-box'>
                {/* 왼쪽 배지 카드 */}
                <div className='owner-badge-card'>
                    {badge && badge.imageUrl && (
                        <img src={badge.imageUrl} alt={badge.name} className='owner-badge-image'/>
                    )}
                    <span className='owner-badge-text'>
                        {badge ? `${badge.name} 달성` : ''}
                    </span>
                </div>

                {/* 중간 상세 수치 리스트 */}
                <div className='owner-stat-white-box'>
                    <div className='owner-stats-list'>
                        <div className='owner-stat-pill'>
                            <div className='owner-stat-label'>
                                <img src={StudyTime} alt='공부시간 아이콘' className='own-study-icon'/>
                                <span className='icon-clock'>공부시간</span>
                            </div>
                            <span className='owner-stat-value'>{points.study}P</span>
                        </div>
                        <div className='owner-stat-pill'>
                            <div className='owner-stat-label'>
                                <img src={StudyIcon} alt='공부 아이콘' className='own-study-icon'/>
                                <span className='icon-study'>스터디</span>
                            </div>
                            <span className='owner-stat-value'>{points.studyParticipation}P</span>
                        </div>
                        <div className='owner-stat-pill'>
                            <div className='owner-stat-label'>
                                <img src={CheckIcon} alt='체크 아이콘' className='owner-icon'/>
                                <span className='icon-todo'>투두리스트</span>
                            </div>
                            <span className='owner-stat-value'>{points.todo}P</span>
                        </div>
                    </div>

                    {/* 오른쪽 총 포인트 */}
                    <div className='owner-total-points'>
                        <div className='owner-total-label'>
                            <img src={OwnerUnion} alt='그라데이션' className='owner-total-dot'/>
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
