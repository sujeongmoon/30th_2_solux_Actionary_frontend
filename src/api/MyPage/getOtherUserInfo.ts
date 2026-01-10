import { api } from '../client';

export interface OtherUserInfo {
  memberId: number;
  nickname: string;
  profileImageUrl: string;
}

export const getOtherUserInfo = async (memberId: number) => {
  const res = await api.get<{
    success: boolean;
    message: string;
    data: OtherUserInfo;
  }>(`/api/members/${memberId}`);

  return res.data.data;
};
