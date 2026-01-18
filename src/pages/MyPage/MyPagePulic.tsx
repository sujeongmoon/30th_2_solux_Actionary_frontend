import React, { useEffect, useState } from 'react';
import './MyPageOwner.css';
import ProfileSectionPublic from '../../components/MyPage/ProfileSectionPublic';        
import { getOtherUserInfo, type OtherUserInfo} from '../../api/MyPage/getOtherUserInfo';
import { useParams, useNavigate } from 'react-router-dom';
import AchievementSectionPublic from '../../components/MyPage/AchievementSectionPublic';


const MyPagePublic: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const [userInfo, setUserInfo] = useState<OtherUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!memberId) return;

    const fetchUserInfo = async() => {
      try {
        const data = await getOtherUserInfo(Number(memberId));
        setUserInfo(data);
      } catch (e) {
        console.error('타인 정보 조회 실패', e);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [memberId]);

  if (loading) return <div>로딩 중...</div>;
  if (!userInfo) return <div>유저 정보 없음</div>;

  return (
    <>
    <div className="owner-header">
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
      >
        ←
      </button>

      <div className="owner-title">마이 페이지</div>
    </div>
    <div className="owner-divider"></div>

    <div className='owner-container'>
      <ProfileSectionPublic userInfo={userInfo} />
      <div className='owner-profile-divider'></div>
      <AchievementSectionPublic memberId={userInfo.memberId} nickname={userInfo.nickname} />
    </div>
    </>
  );
}

export default MyPagePublic;