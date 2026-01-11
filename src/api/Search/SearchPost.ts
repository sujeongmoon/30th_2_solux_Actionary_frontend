// src/api/SearchPost.ts
import { api } from '../client';

export interface SearchPostItem {
  postId: number;
  type: string;
  title: string;
  authorNickname: string;
  createdAt: string;
  commentCount: number;
  isMine: boolean;
}

export interface SearchPageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SearchPostResponse {
  success: boolean;
  message: string;
  data: {
    content: SearchPostItem[];
    pageInfo: SearchPageInfo;
  };
}

export const searchPosts = async (
  query: string,
  page: number = 1,
  size: number = 10,
  sort?: 'LATEST' | 'POPULAR',
  category?: string
): Promise<SearchPostResponse['data']> => {
  const res = await api.get<SearchPostResponse>('/search/posts', {
    params: {
      q: query,
      page,
      size,
      sort,
      ...(category ? { category } : {}),
    },
  });

  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};
