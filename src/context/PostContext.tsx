// src/context/PostContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// 게시글 타입
export interface Post {
  postId: number;
  title: string;
  type: string;
  content: {
    text_content: string;
    image_urls: string[];
  };
  nickname: string;
  created_at: string;
  comment_count: number;
}

// 초기 Mock 데이터
const initialPosts: Post[] = [
  {
    postId: 101,
    title: 'ERD 설계 질문입니다',
    type: '질문',
    content: { text_content: '<p>게시글 본문 내용</p>', image_urls: ['https://picsum.photos/seed/board1/600/400'] },
    nickname: '가인',
    created_at: '2026-01-03T10:00:00',
    comment_count: 3,
  }
];

interface PostContextType {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  addPost: (post: Post) => void;
  updatePost: (updatedPost: Post) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) throw new Error('usePosts must be used within PostProvider');
  return context;
};

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const addPost = (post: Post) => {
    setPosts(prev => [...prev, post]);
  };

  const updatePost = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => (p.postId === updatedPost.postId ? updatedPost : p)));
  };

  return (
    <PostContext.Provider value={{ posts, setPosts, addPost, updatePost }}>
      {children}
    </PostContext.Provider>
  );
};
