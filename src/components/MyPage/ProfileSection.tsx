import React, { useEffect, useRef, useState } from 'react';
import Pencil from '../../assets/MyPage/Pencil.svg';
import Profile from '../../assets/MyPage/Profile.svg';
import './ProfileSection.css';
import NickNameModal from './NickNameModal';
import WithdrawModal from './WithdrawModal';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  user_id: number;
  profile_image_url: string;
  nickname: string;
  phoneNumber: string;
  birthday: string;
}

// MOCK DATA (API 연동 전 임시 사용)
const mockUserInfo: UserInfo = {
  user_id: 1,
  profile_image_url: 'https://i.pravatar.cc/150?img=3',
  nickname: 'mockUser',
  phoneNumber: '010-1234-5678',
  birthday: '2000-01-01',
};

const ProfileSection: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  { /* API 연동 시 다시 사용하기 */}
  {/*
  useEffect(() => {
    
    const fetchUserInfo = async () => {
      try {
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

    } catch (err) {
        console.error(err);
        setError('회원 정보를 불러오지 못했습니다.');
    } finally {
        setLoading(false);
    }};
    fetchUserInfo();
  }, []); */}
  
  // MockData 삭제하기
  useEffect(() => {
    setUserInfo(mockUserInfo);
    setLoading(false);
  })

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleNicknameSave = async (newNickname: string) => {
    if (!newNickname.trim()) return;
    setUserInfo((prev) => prev ? {...prev, nickname: newNickname } : prev);
    closeModal();

    try {
      const response = await fetch('/api/users/me/nickname', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ nickname: newNickname }),
      });

      if (!response.ok) throw new Error(`API 에러: ${response.status}`);
      const data = await response.json();
      setUserInfo((prev) => prev ? { ...prev, nickname: data.data.nickname } : prev);
      


    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('닉네임 수정 실패');
    }
  };

  const handleWithdraw = async () => {
    console.log('탈퇴 처리 로직 실행');
    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch('/api/auth/withdraw', {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer$${accessToken}`,
                'Content-Type' : 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`탈퇴 실패: ${response.status}`);
        }

        localStorage.clear();
        setIsWithdrawOpen(false);
        navigate('/');
    } catch (err) {
        console.error(err);
        alert('회원 탈퇴에 실패했습니다.');
    }
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append('profile_image', file); 

    try {
        const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            // 'Content-Type': 'multipart/form-data'는 브라우저가 자동 설정
        },
        body: formData,
        });

        if (!response.ok) throw new Error(`API 에러: ${response.status}`);
        const data = await response.json();

        // UI 업데이트
        setUserInfo((prev) => prev ? { ...prev, profile_image_url: data.profile_image_url } : prev);
    } catch (err) {
        console.error('프로필 업로드 실패', err);
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
        <div className="owner-avatar-plus" onClick={() => fileInputRef.current?.click()}></div>
        <input
            type="file"
            ref={fileInputRef}
            className='hidden-input'
            accept="image/*"
            onChange={handleFileChange}
            aria-label='프로필 이미지 업로드'
        />
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
        <button 
            className="owner-withdraw-btn"
            onClick = {() => setIsWithdrawOpen(true)}
        >
            탈퇴하기
        </button>
      </div>

      {/* 모달 */}
      <NickNameModal
        isOpen = {isModalOpen}
        initialValue= {userInfo?.nickname || ''}
        onClose={closeModal}
        onSave={handleNicknameSave}
      />
      <WithdrawModal
        isOpen = {isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onWithdraw={handleWithdraw}
      />
    </div>
  );
};

export default ProfileSection;
