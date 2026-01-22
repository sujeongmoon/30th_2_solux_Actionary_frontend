import React, { useRef, useState } from 'react';
import Pencil from '../../assets/MyPage/Pencil.svg';
import Profile from '../../assets/MyPage/Profile.svg';
import './ProfileSection.css';
import NickNameModal from './NickNameModal';
import WithdrawModal from './WithdrawModal';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyInfo } from '../../api/sidebar';

const ProfileSection: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  /* =======================
     1️⃣ 유저 정보 조회
  ======================= */
  const {
    data: userInfo,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['myInfo'],
    queryFn: getMyInfo,
  });

  /* =======================
     2️⃣ 닉네임 수정
  ======================= */
  const nicknameMutation = useMutation({
    mutationFn: (nickname: string) =>
      api.patch('/members/me/nickname', { nickname }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInfo'] });
      setIsModalOpen(false);
    },
  });

  const handleNicknameSave = (newNickname: string) => {
    if (!newNickname.trim()) return;
    nicknameMutation.mutate(newNickname);
  };

  /* =======================
     3️⃣ 프로필 이미지 업로드
  ======================= */
  const profileImageMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('profileImage', file);
      return api.patch('/members/me/profile', formData);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInfo'] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    profileImageMutation.mutate(e.target.files[0]);
  };

  /* =======================
     4️⃣ 회원 탈퇴
  ======================= */
  const withdrawMutation = useMutation({
    mutationFn: () => api.delete('/auth/withdraw'),

    onSuccess: () => {
      localStorage.clear();
      navigate('/');
    },
  });

  /* =======================
     렌더링 분기
  ======================= */
  if (isLoading) return <div>로딩중...</div>;
  if (isError || !userInfo)
    return <div>회원 정보를 불러오지 못했습니다.</div>;

  return (
    <div className="owner-profile-container">
      {/* 프로필 이미지 */}
      <div className="owner-avatar-container">
        <div className="owner-avatar-white-circle">
          <img
            src={userInfo.profileImageUrl || Profile}
            alt="profile"
            className={
              userInfo.profileImageUrl
                ? 'owner-avatar-img-full'
                : 'owner-profile-img'
            }
          />
        </div>

        <div
          className="owner-avatar-plus"
          onClick={() => fileInputRef.current?.click()}
        />

        <input
          title="사진 첨부"
          type="file"
          ref={fileInputRef}
          className="hidden-input"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* 유저 정보 */}
      <div className="owner-info-container">
        <div className="owner-nickname-group">
          <div className="owner-nickname-wrapper">
            <span className="owner-nickname">{userInfo.nickname}</span>
            <div className="owner-nickname-underline" />
          </div>

          <img
            src={Pencil}
            alt="편집 아이콘"
            className="owner-edit-icon"
            onClick={() => setIsModalOpen(true)}
          />
        </div>

        <div className="owner-details-group">
          <span className="owner-detail-item">
            생일: {userInfo.birthday}
          </span>
          <span className="owner-detail-item">
            번호: {userInfo.phoneNumber}
          </span>
        </div>
      </div>

      {/* 탈퇴 */}
      <div className="owner-withdraw-wrapper">
        <button
          className="owner-withdraw-btn"
          onClick={() => setIsWithdrawOpen(true)}
        >
          탈퇴하기
        </button>
      </div>

      {/* 닉네임 모달 */}
      <NickNameModal
        isOpen={isModalOpen}
        initialValue={userInfo.nickname}
        onClose={() => setIsModalOpen(false)}
        onSave={handleNicknameSave}
      />

      {/* 탈퇴 모달 */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onWithdraw={() => withdrawMutation.mutate()}
      />
    </div>
  );
};

export default ProfileSection;
