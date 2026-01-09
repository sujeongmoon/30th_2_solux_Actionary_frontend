import React from 'react';
import Profile from '../../assets/MyPage/Profile.svg';
import './ProfileSection.css';

export interface PublicUserInfo {
  memberId: number;
  nickname: string;
  profileImageUrl: string;
}

interface ProfileSectionPublicProps {
  userInfo: PublicUserInfo;
}

const ProfileSectionPublic: React.FC<ProfileSectionPublicProps> = ({ userInfo }) => {
  return (
    <div className="owner-profile-container">
      <div className="owner-avatar-container">
        <div className="owner-avatar-white-circle">
          <img
            src={userInfo.profileImageUrl || Profile}
            alt="profile"
            className="owner-avatar-img-full"
          />
        </div>
      </div>

      <div className="owner-info-container-public">
        <div className="owner-nickname-group">
          <span className="owner-nickname">{userInfo.nickname}</span>
          <div className="owner-nickname-underline"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSectionPublic;
