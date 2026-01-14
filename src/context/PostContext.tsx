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
  const [posts, setPosts] = useState<Post[]>([]);

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