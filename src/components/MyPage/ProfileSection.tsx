import React, { useEffect, useState } from 'react';
import Pencil from '../../assets/MyPage/Pencil.svg';
import Profile from '../../assets/MyPage/Profile.svg';
import './ProfileSection.css';
import NickNameModal from './NickNameModal';

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

  // Modal 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
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

      const dummyData: UserInfo = {
        user_id: 1,
        profile_image_url: 'https://i.pravatar.cc/150?img=3',
        nickname: '솔룩스140',
        phoneNumber: '010-1234-5678',
        birthday: '1995-10-25',
      };
      setTimeout(() => {
        setUserInfo(dummyData);
        setLoading(false);
      }, 500);
    } catch (err) {
        console.error(err);
    }};
    fetchUserInfo();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleNicknameSave = async (newNickname: string) => {
    if (!newNickname.trim()) return;
    setUserInfo((prev) => prev ? {...prev, nickname: newNickname } : prev);
    closeModal();

    try {
      // 서버 연결 시 주석 해제
      /*
      const response = await fetch('/api/users/me/nickname', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ nickname: modalInput }),
      });

      if (!response.ok) throw new Error(`API 에러: ${response.status}`);
      const data = await response.json();
      setUserInfo((prev) => prev ? { ...prev, nickname: data.data.nickname } : prev);
      */

      // 더미 테스트
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('닉네임 수정 실패');
    }
  };

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <div className="owner-profile-container">
      <div className="owner-avatar-container">
        <div className="owner-avatar-white-circle">
          <img
            src={userInfo?.profile_image_url || Profile}
            alt="profile"
            className={userInfo?.profile_image_url ? 'owner-avatar-img-full' : 'owner-profile-img'}
          />
        </div>
        <div className="owner-avatar-plus"></div>
      </div>

      <div className="owner-info-container">
        <div className="owner-nickname-group">
          <div className="owner-nickname-wrapper">
            <span className="owner-nickname">{userInfo?.nickname}</span>
            <div className="owner-nickname-underline"></div>
          </div>
          <img
            src={Pencil}
            alt="편집 아이콘"
            className="owner-edit-icon"
            onClick={openModal}
          />
        </div>

        <div className="owner-details-group">
          <span className="owner-detail-item">생일: {userInfo?.birthday}</span>
          <span className="owner-detail-item">번호: {userInfo?.phoneNumber}</span>
        </div>
      </div>

      <div className="owner-withdraw-wrapper">
        <button className="owner-withdraw-btn">탈퇴하기</button>
      </div>

      {/* 모달 */}
      <NickNameModal
        isOpen = {isModalOpen}
        initialValue= {userInfo?.nickname || ''}
        onClose={closeModal}
        onSave={handleNicknameSave}
      />
    </div>
  );
};

export default ProfileSection;
