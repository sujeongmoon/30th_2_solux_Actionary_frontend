// src/context/PostContext.tsx
import React, { createContext, useContext, useState, type ReactNode } from 'react';

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
    content: {
      text_content: '<p>게시글 본문 내용</p>',
      image_urls: ['https://picsum.photos/seed/board1/600/400'],
    },
    nickname: '가인',
    created_at: '2026-01-03T10:00:00',
    comment_count: 3,
  },
  {
    postId: 102,
    title: 'React useEffect 이해하기',
    type: '질문',
    content: {
      text_content: '<p>useEffect를 잘 이해하고 싶은데요.</p>',
      image_urls: [],
    },
    nickname: '개발자B',
    created_at: '2026-01-04T12:30:00',
    comment_count: 2,
  },
  {
    postId: 103,
    title: 'JavaScript Array 메서드 정리',
    type: '공유',
    content: {
      text_content: '<p>map, filter, reduce 정리 자료</p>',
      image_urls: [],
    },
    nickname: '개발자C',
    created_at: '2026-01-05T09:20:00',
    comment_count: 5,
  },
  {
    postId: 104,
    title: 'CSS Flexbox vs Grid',
    type: '토론',
    content: {
      text_content: '<p>Flexbox와 Grid 어떤 경우에 사용하는지 의견 나눠요.</p>',
      image_urls: ['https://picsum.photos/seed/board4/600/400'],
    },
    nickname: '디자이너A',
    created_at: '2026-01-06T15:45:00',
    comment_count: 1,
  },
  {
    postId: 105,
    title: 'TypeScript 타입 유틸 정리',
    type: '공유',
    content: {
      text_content: '<p>Partial, Pick, Omit 등 타입 유틸 예제</p>',
      image_urls: [],
    },
    nickname: '개발자D',
    created_at: '2026-01-07T08:10:00',
    comment_count: 0,
  },
  {
    postId: 106,
    title: 'Node.js 서버 구조 질문',
    type: '질문',
    content: {
      text_content: '<p>Express 프로젝트 구조 관련해서 질문 있어요.</p>',
      image_urls: ['https://picsum.photos/seed/board6/600/400'],
    },
    nickname: '개발자E',
    created_at: '2026-01-08T14:55:00',
    comment_count: 4,
  },
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