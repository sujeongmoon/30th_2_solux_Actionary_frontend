import React, { useEffect, useState } from 'react';
import Pencil from '../../assets/MyPage/Pencil.svg';
import Profile from '../../assets/MyPage/Profile.svg';
import './ProfileSection.css';

interface UserInfo {
  user_id: number;
  profile_image_url: string;
  nickname: string;
  phoneNumber: string;
  birthday: string;
}

const ProfileSection: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // 서버 연결 부분은 주석 처리
        /*
        const response = await fetch('/api/users/me/info', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API 에러: ${response.status}`);
        }

        const data = await response.json();
        setUserInfo(data.data);
        */

        // 서버 없을 때 테스트용 더미 데이터
        const dummyData: UserInfo = {
          user_id: 1,
          profile_image_url: 'https://i.pravatar.cc/150?img=3',
          nickname: '솔룩스140',
          phoneNumber: '010-1234-5678',
          birthday: '1995-10-25',
        };

        // 비동기 느낌을 위해 setTimeout 사용
        setTimeout(() => {
          setUserInfo(dummyData);
          setLoading(false);
        }, 500);

      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('사용자 정보를 불러오지 못했습니다.');
        }
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <div className="owner-profile-container">
      <div className="owner-avatar-container">
        <div className="owner-avatar-white-circle">
          {userInfo?.profile_image_url ? (
            <img
                src = {userInfo.profile_image_url}
                alt = "profile"
                className='owner-avatar-img-full'
            />
          ) : (
            <img src= {Profile} alt="profile" className='owner-profile-img' />
          )} 

        </div>
        <div className="owner-avatar-plus"></div>
      </div>

      <div className="owner-info-container">
        <div className="owner-nickname-group">
          <div className="owner-nickname-wrapper">
            <span className="owner-nickname">{userInfo?.nickname}</span>
            <div className="owner-nickname-underline"></div>
          </div>
          <img src={Pencil} alt="편집 아이콘" className="owner-edit-icon" />
        </div>

        <div className="owner-details-group">
          <span className="owner-detail-item">생일: {userInfo?.birthday}</span>
          <span className="owner-detail-item">번호: {userInfo?.phoneNumber}</span>
        </div>
      </div>

      <div className="owner-withdraw-wrapper">
        <button className="owner-withdraw-btn">탈퇴하기</button>
      </div>
    </div>
  );
};

export default ProfileSection;
