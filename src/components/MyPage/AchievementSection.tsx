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
    badgeId: number;
    badgeName: string;
    requiredPoint: number;
    badgeImageUrl: string;
    memberId?: number;
}

interface AchievementSectionProps {
    memberId: number;
    nickname?: string;
}

const DEFAULT_BADGE: Badge = {
  badgeId: 0,
  badgeName: '0P',
  badgeImageUrl: '/images/badge_default.svg',
  requiredPoint: 0,
};

const AchievementSection : React.FC<AchievementSectionProps> = ({ memberId, nickname }) => {
    const [points, setPoints] = useState<Points>({
        study: 0,
        studyParticipation: 0,
        todo: 0,
        total: 0,
    });
    const [badge, setBadge] = useState<Badge>(DEFAULT_BADGE);

    useEffect(() => {
        if (!memberId) return;
        const fetchPoints = async () => {
            try {
                const res = await api.get(`/users/${memberId}/points`);
                setPoints(res.data.data.points); //points만 가져오기
            } catch (error) {
                console.error('포인트 조회 실패', error);
            }
        };

        fetchPoints();
    }, [memberId]);

    useEffect(() => {
        const fetchBadge = async () => {
            try {
                const res = await api.get(`/users/${memberId}/badge`);
                setBadge(res.data.result ?? DEFAULT_BADGE);
            } catch (error) {
                console.error('배지 조회 실패', error);
                setBadge(DEFAULT_BADGE);
            }
        };
        fetchBadge();
    }, [memberId]);

    return (
        <div className='owner-achievement-section'>
            <div className='owner-achievement-header'>
                <img src={Union} alt = "제목" className='owner-achievement-dot'></img>
                <span className='owner-achievement-title'>{nickname ? `현재 ${nickname}님의 업적` : '현재 나의 업적'}</span>
            </div>

        <div className='owner-stats-box'>
            {/* 1. 왼쪽 배지 카드 */}
            <div className='owner-badge-card'>
                {badge.badgeImageUrl && (
                    <img
                        src={badge.badgeImageUrl}
                        alt={badge.badgeName}
                        className='owner-badge-image'
                    />
                )}
            <span className='owner-badge-text'>
                {badge.badgeName ? `${badge.badgeName} 달성`: ''}
            </span>
            </div>

            {/* 2. 중간 상세 수치 리스트 */}
            <div className='owner-stat-white-box'>
                <div className='owner-stats-list'>
                    <div className='owner-stat-pill'>
                        <div className='owner-stat-label'>
                            <img src = {StudyTime} alt='공부시간 아이콘' className='own-study-icon' />
                            <span className='icon-clock'>공부시간</span>
                        </div>
                        <span className='owner-stat-value'>{points.study}P</span>
                    </div>
                    <div className='owner-stat-pill'>
                        <div className='owner-stat-label'>
                            <img src = {StudyIcon} alt = '공부 아이콘' className='own-study-icon'/>
                            <span className='icon-study'>스터디</span>
                        </div>
                        <span className='owner-stat-value'>{points.studyParticipation}P</span>
                    </div>
                    <div className='owner-stat-pill'>
                        <div className='owner-stat-label'>
                            <img src = {CheckIcon} alt='체크 아이콘' className='owner-icon' />
                            <span className='icon-todo'>투두리스트</span>
                        </div>
                        <span className='owner-stat-value'>{points.todo}P</span>
                    </div>
                </div>

            {/* 3. 오른쪽 총 포인트 */}
                <div className='owner-total-points'>
                    <div className='owner-total-label'>
                        <img src = {OwnerUnion} alt = '그라데이션' className='owner-total-dot' />
                            <span>총 포인트</span>
                        </div>
                        <span className='owner-total-value'>{points.total}P</span>
                    </div>

                </div>

            </div>
        </div>
    )
};

export default AchievementSection;