import React from 'react';
import Pencil from '../../assets/MyPage/Pencil.svg';
import Profile from '../../assets/MyPage/Profile.svg'
import './ProfileSection.css';


const ProfileSection = () => {
    return (
                <div className='owner-profile-container'>
        {/* 프로필 이미지 원형 박스 */}
          <div className="owner-avatar-container">
            <div className="owner-avatar-white-circle">
              <img src={Profile} alt="profile" className="owner-profile-img" />
            </div>
            {/* 우측 하단 플러스 버튼 */}
            <div className="owner-avatar-plus"></div>
          </div>

          {/* 닉네임 및 상세 정보 영역 */}
          <div className='owner-info-container'>
            <div className='owner-nickname-group'>
                <div className='owner-nickname-wrapper'>
                    <span className='owner-nickname'>닉네임</span>
                    <div className='owner-nickname-underline'></div>
                </div>

                {/*수정 아이콘*/}
                <img src={Pencil} alt="편집 이모지" className='owner-edit-icon'></img>
            </div>

            <div className='owner-details-group'>
                <span className='owner-detail-item'>생일 : 2004 01 02</span>
                <span className='owner-detail-item'>번호: 01011111111</span>
            </div>
          </div>

          {/*탈퇴하기 버튼*/}
          <div className='owner-withdraw-wrapper'>
            <button className='owner-withdraw-btn'>탈퇴하기</button>
          </div>
        </div>
    )
};

export default ProfileSection;