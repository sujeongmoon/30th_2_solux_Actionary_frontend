import { api } from '../client';
import type { PostDetailResponse } from '../../types/Board';

export const getMyInfo = async () => {
    const res = await api.get('/members/me/info');
    return res.data;
}

export const getPostDetail = async (postId: number) => {
  const res = await api.get<PostDetailResponse>(`/posts/${postId}`);
  return res.data;
};

export const deletePost = async (postId: number) => {
  try {
    const res = await api.delete(`/posts/${postId}`);
    return res.data; // { success: true, message: '삭제 완료' }
  } catch (error) {
    console.error(error);
    return { success: false, message: '삭제 실패' };
  }
};
