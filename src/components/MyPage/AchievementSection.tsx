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

{/* MOCK DATA */}
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



const AchievementSection = () => {
    const [points, setPoints] = useState<Points>({
        study: 0,
        studyParticipation: 0,
        todo: 0,
        total: 0,
    });

    const [badge, setBadge] = useState<Badge>({
        badge_id: 0,
        badge_name: '0P',
        badge_image_url: '',
    });



    useEffect(() => {
        
        setPoints(MOCK_POINTS); //가짜 데이터, 연동 시 지우기

        {/* 연동 시 주석 제외하기 */}
        /*
        const fetchPoints = async () => {
            try {
                const res = await fetch('/api/users/{userId}/points');
                const result = await res.json();

                setPoints(result.data.points);
            } catch (error) {
                console.error('포인트 조회 실패', error);
            }
        };

        fetchPoints();
        */
    }, []);

    useEffect(() => {

        setBadge(MOCK_BADGE); //연동 시 삭제하기

        /*
        const fetchBadge = async () => {
            try {
                const res = await fetch('/api/users/me/badge');
                const result = await res.json();

                setBadge(result.result);
            } catch (error) {
                console.error('배지 조회 실패', error);
            }
        };
        fetchBadge();
        */
    }, [])

    return (
        <div className='owner-achievement-section'>
            <div className='owner-achievement-header'>
                <img src={Union} alt = "제목" className='owner-achievement-dot'></img>
                <span className='owner-achievement-title'>현재 나의 업적</span>
            </div>

        <div className='owner-stats-box'>
            {/* 1. 왼쪽 배지 카드 */}
            <div className='owner-badge-card'>
                {badge.badge_image_url && (
                    <img
                        src={badge.badge_image_url}
                        alt={badge.badge_name}
                        className='owner-badge-image'
                    />
                )}
            <span className='owner-badge-text'>
                {badge.badge_name ? `${badge.badge_name} 달성`: ''}
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