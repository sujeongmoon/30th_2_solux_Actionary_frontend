import React from 'react';
import './MyPageOwner.css';
import ProfileSectionPublic from '../../components/MyPage/ProfileSectionPublic';        
import AchievementSectionPublic from '../../components/MyPage/AchievementSectionPublic';

const MyPagePublic: React.FC = () => {
  return (
    <>
    <div>
      <div className='owner-title'>마이 페이지</div>
      <div className='owner-divider'></div>
    </div>
    <div className='owner-container'>
    <ProfileSectionPublic />
      <div className='owner-profile-divider'></div>
      <AchievementSectionPublic />
    </div>
    </>
  );
}

export default MyPagePublic;