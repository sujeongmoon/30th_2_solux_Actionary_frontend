import { api } from "./client";

interface GetPostsParams {
  page: number;
  size?: number;
  type?: string;
}

export const getPopularPosts = async ({ page, size = 10, type }: GetPostsParams) => {
  const res = await api.get('/api/posts/popular', {
    params: {
      page,
      size,
      ...(type && { type }),
    },
  });

  return res.data.data;
};

export const getLatestPosts = async ({ page, size = 10, type }: GetPostsParams) => {
  const res = await api.get('/api/posts/latest', {
    params: {
      page,
      size,
      ...(type && { type }),
    },
  });

  return res.data.data;
};
