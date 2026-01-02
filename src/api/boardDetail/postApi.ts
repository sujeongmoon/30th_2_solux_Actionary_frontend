import { api } from '../client';
import type { PostDetailResponse } from '../../types/Board';

export const getPostDetail = async (postId: number) => {
  const res = await api.get<PostDetailResponse>(`/api/posts/${postId}`);
  return res.data;
};
