import React, { useEffect, useState } from 'react';
import Profile from '../../assets/MyPage/Profile.svg';
import './ProfileSection.css';

interface UserInfo {
  user_id: number;
  profile_image_url: string;
  nickname: string;
}

// MOCK DATA (API 연동 전 임시 사용)
const mockUserInfo: UserInfo = {
  user_id: 1,
  profile_image_url: 'https://i.pravatar.cc/150?img=3',
  nickname: 'mockUser',
};

const ProfileSection: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     🔹 공개 마이페이지 API 연동
     ========================= */
  /*
  useEffect(() => {
    const fetchPublicUserProfile = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API 에러: ${response.status}`);
        }

        const data = await response.json();
        setUserInfo(data.data);
      } catch (err) {
        console.error(err);
        setError('사용자 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicUserProfile();
  }, [userId]);
  */

  // 🔸 현재는 mock 데이터 사용
  useEffect(() => {
    setUserInfo(mockUserInfo);
    setLoading(false);
  }, []);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <div className="owner-profile-container">
      <div className="owner-avatar-container">
        <div className="owner-avatar-white-circle">
          <img
            src={userInfo?.profile_image_url || Profile}
            alt="profile"
            className={
              userInfo?.profile_image_url
                ? 'owner-avatar-img-full'
                : 'owner-profile-img'
            }
          />
        </div>
      </div>

      <div className="owner-info-container-public">
        <div className="owner-nickname-group">
            <span className="owner-nickname">{userInfo?.nickname}</span>
            <div className="owner-nickname-underline"></div>
          </div>
        </div>
      </div>
  );
};

export default ProfileSection;
