import React, { useEffect, useState } from 'react';
import './MyPageOwner.css';
import { useParams } from 'react-router-dom';
import ProfileSectionPublic from '../../components/MyPage/ProfileSectionPublic';        
import AchievementSectionPublic from '../../components/MyPage/AchievementSectionPublic';
import { getOtherUserInfo, type OtherUserInfo} from '../../api/MyPage/getOtherUserInfo';

const MyPagePublic: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const [userInfo, setUserInfo] = useState<OtherUserInfo | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div>
      <div className='owner-title'>마이 페이지</div>
      <div className='owner-divider'></div>
    </div>
    <div className='owner-container'>
      <ProfileSectionPublic userInfo={userInfo} />
      <div className='owner-profile-divider'></div>
      <AchievementSectionPublic memberId={userInfo.memberId} />
    </div>
    </>
  );
}

export default MyPagePublic;