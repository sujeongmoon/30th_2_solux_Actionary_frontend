// src/context/PostContext.tsx
import React, { createContext, useContext, useState, type ReactNode } from 'react';

export interface Author {
  memberId: number;
  nickname: string;
  profileImageUrl: string;
  badge: number;
}

export interface PostDetailData {
  post: {
    postId: number;
    type: string;
    title: string;
    textContent: string;
    commentCount: number;
    created_at: string;
  };
  postImageUrls: string[];
  author: Author;
}



interface PostContextType {
  posts: PostDetailData[];
  setPosts: React.Dispatch<React.SetStateAction<PostDetailData[]>>;
  addPost: (post: PostDetailData) => void;
  updatePost: (updatedPost: PostDetailData) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) throw new Error('usePosts must be used within PostProvider');
  return context;
};

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<PostDetailData[]>([]);

  const addPost = (post: PostDetailData) => {
    setPosts(prev => [...prev, post]);
  };

  const updatePost = (updatedPost: PostDetailData) => {
    setPosts(prev => prev.map(p => (p.post.postId === updatedPost.post.postId ? updatedPost : p)));
  };

  return (
    <PostContext.Provider value={{ posts, setPosts, addPost, updatePost }}>
      {children}
    </PostContext.Provider>
  );
};