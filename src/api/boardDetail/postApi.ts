import { api } from '../client';
import type { PostDetailResponse } from '../../types/Board';

export const getPostDetail = (postId: number) => {
  return api.get<PostDetailResponse>(`/board/${postId}`);
};
