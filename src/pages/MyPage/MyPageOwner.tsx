import React from 'react';
import './MyPageOwner.css';
import Profile from '../../assets/MyPage/Profile.svg'
import Pencil from '../../assets/MyPage/Pencil.svg';
import Union from '../../assets/MyPage/Union.svg';
import StudyTime from '../../assets/MyPage/StudyTime.svg';
import StudyIcon from '../../assets/MyPage/StudyIcon.svg';
import CheckIcon from '../../assets/MyPage/CheckIcon.svg';
import OwnerUnion from '../../assets/MyPage/OwnerUnion.svg';

const MyPageOwner: React.FC = () => {
  return (
    <div>
      <div className='owner-title'>마이 페이지</div>
      <div className='owner-divider'></div>

      {/*상단 그라데이션 박스*/}
      <div className='owner-container'>
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
        <div className='owner-profile-divider'></div>

        {/* 업적 섹션 */}
        <div className='owner-achievement-section'>
            <div className='owner-achievement-header'>
                <img src={Union} alt = "제목" className='owner-achievement-dot'></img>
                <span className='owner-achievement-title'>현재 나의 업적</span>
            </div>

        <div className='owner-stats-box'>
            {/* 1. 왼쪽 배지 카드 */}
            <div className='owner-badge-card'>
            <div className='owner-badge-circle'>
                {/* 중앙에 들어가는 로고/숫자 이미지 */}
                <div className='owner-badge-logo'>100</div>
            </div>
            <span className='owner-badge-text'>100P 달성</span>
            </div>

            {/* 2. 중간 상세 수치 리스트 */}
            <div className='owner-stat-white-box'>
                <div className='owner-stats-list'>
                    <div className='owner-stat-pill'>
                        <div className='owner-stat-label'>
                            <img src = {StudyTime} alt='공부시간 아이콘' className='own-study-icon' />
                            <span className='icon-clock'>공부시간</span>
                        </div>
                        <span className='owner-stat-value'>100P</span>
                    </div>
                    <div className='owner-stat-pill'>
                        <div className='owner-stat-label'>
                            <img src = {StudyIcon} alt = '공부 아이콘' className='own-study-icon'/>
                            <span className='icon-study'>스터디</span>
                        </div>
                        <span className='owner-stat-value'>20P</span>
                    </div>
                    <div className='owner-stat-pill'>
                        <div className='owner-stat-label'>
                            <img src = {CheckIcon} alt='체크 아이콘' className='owner-icon' />
                            <span className='icon-todo'>투두리스트</span>
                        </div>
                        <span className='owner-stat-value'>2P</span>
                    </div>
                </div>

            {/* 3. 오른쪽 총 포인트 */}
                <div className='owner-total-points'>
                    <div className='owner-total-label'>
                        <img src = {OwnerUnion} alt = '그라데이션' className='owner-total-dot' />
                            <span>총 포인트</span>
                        </div>
                        <span className='owner-total-value'>122P</span>
                    </div>

                </div>

            </div>
        </div>

      </div>

      
    </div>
  );
};

export default MyPageOwner;
