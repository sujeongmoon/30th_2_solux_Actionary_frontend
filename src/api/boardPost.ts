import { api } from "./client";

interface GetPostsParams {
  page: number;
  size?: number;
  type?: string;
}


// src/api/boardPost.ts (또는 PostContext.tsx)
export interface Post {
  postId: number;
  type: string;
  title: string;
  nickname: string;
  createdAt: string;
  commentCount: number;
}


export const getPopularPosts = async ({ page, size = 10, type }: GetPostsParams) => {
  const res = await api.get('/posts/popular', {
    params: {
      page,
      size,
      ...(type && { type }),
    },
  });

  return res.data.data;
};

export const getLatestPosts = async ({ page, size = 10, type }: GetPostsParams) => {
  const res = await api.get('/posts/latest', {
    params: {
      page,
      size,
      ...(type && { type }),
    },
  });

  return res.data.data;
};
