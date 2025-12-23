import React, { useState } from 'react';
import './MyPageOwner.css';
import BookmarkSection from '../../components/Bookmark/BookmarkSection';
import OwnerCheck from '../../assets/MyPage/OwnerCheck.svg';
import ProfileSection from '../../components/MyPage/ProfileSection';
import AchievementSection from '../../components/MyPage/AchievementSection';
import StudyTimeCheckIcon from '../../assets/MyPage/StudyTimeCheck.svg';

const MyPageOwner: React.FC = () => {

  type Tabkey = 'day' | 'week' | 'month' | 'year';

  const tabs : { key: Tabkey; label: string} []= [
    { key: 'day', label: '일간'},
    { key: 'week', label: '주간'},
    { key: 'month', label: '월간'},
    { key: 'year', label: '연간'},
  ];

  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month' | 'year'>('day');

  return (
    <div>
      <div className='owner-title'>마이 페이지</div>
      <div className='owner-divider'></div>

      {/*상단 그라데이션 박스*/}
      <div className='owner-container'>
        <ProfileSection />
        <div className='owner-profile-divider'></div>
        <AchievementSection />

      </div>
      <div className='owner-divider-box' />
      <BookmarkSection />
      <div className='owner-divider-box' />
    
      <div className='owner-todo-section'>
        {/* 왼쪽: 오늘의 TO DO LIST 카드 */}
        <div className='owner-card-todo'>
          <div className='owner-study-header'>
            <span className='owner-todo-title'>오늘의 TO DO LIST</span>
            <button className='owner-more-btn'>더보기</button>
          </div>

            
            <div className='owner-todo-body'>
            {/* 솔룩스 섹션 */}
            <div className='owner-todo-group'>
                <span className='owner-todo-tag solux'>솔룩스</span>
                <div className='owner-todo-item'>
                <img src={OwnerCheck} alt="체크 아이콘" className='owner-todo-check' />
                <span className='owner-todo-text'>시험장에 에어컨 잘 나오나요</span>
                <div className='owner-todo-status'>
                    <button className='owner-status-btn active'>달성</button>
                    <button className='owner-status-btn'>실패</button>
                </div>
                </div>
                <div className='owner-todo-item'>
                <img src = {OwnerCheck} alt='체크 아이콘' className='owner-todo-check' />
                <span className='owner-todo-text'>시험장에 에어컨 잘 나오나요</span>
                <div className='owner-todo-status'>
                    <button className='owner-status-btn'>달성</button>
                    <button className='owner-status-btn fail'>실패</button>
                </div>
                </div>
            </div>

            <div className='owner-todo-divider2'></div>

            {/* 수업 섹션 */}
            <div className='owner-todo-group'>
                <span className='owner-todo-tag class'>수업</span>
                <div className='owner-todo-item'>
                <img src = {OwnerCheck} alt = "체크 아이콘" className='owner-todo-check' />
                <span className='owner-todo-text'>시험장에 에어컨 잘 나오나요</span>
                <div className='owner-todo-status'>
                    <button className='owner-status-btn active'>달성</button>
                    <button className='owner-status-btn'>실패</button>
                </div>
                </div>
                <div className='owner-todo-item'>
                <img src = {OwnerCheck} alt = '체크 아이콘' className='owner-todo-check' />
                <span className='owner-todo-text'>시험장에 에어컨 잘 나오나요</span>
                <div className='owner-todo-status'>
                    <button className='owner-status-btn'>달성</button>
                    <button className='owner-status-btn fail'>실패</button>
                </div>
                </div>
            </div>
            </div>
        </div>

        {/* 오른쪽: 공부량 카드 */}
        <div className='owner-card-study'>
            <div className='owner-study-title'>공부량</div>
            
            <div className='owner-study-body'>
            <div className='owner-study-tabs'>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;

                    return (
                        <span
                            key = {tab.key}
                            className={`owner-tab ${isActive ? 'active': ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <span className='owner-tab-icon'>
                                {isActive 
                                    ? <img src = {StudyTimeCheckIcon} alt ='체크' />
                                    : (
                                        <span className='owner-tab-dot' />
                                    )}
                            </span>
                            <span className='owner-tab-text'>{tab.label}</span>
                        </span>
                    );
                })}
            </div>
            
            <div className='owner-study-time-box'>
                22H 30M
            </div>
            
            <button className='owner-manual-add-btn'>
                수동으로 추가하기 <span className='owner-plus-circle'>+</span>
            </button>
            </div>
        </div>
        </div>
      
    </div>
  );
};

export default MyPageOwner;
