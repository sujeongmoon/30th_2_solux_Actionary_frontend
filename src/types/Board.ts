export interface Post {
  postId: number;
  type: string;
  title: string;
  textContent: string;
  commentCount: number;
  createdAt: string;
}


// 게시글 생성 Response 타입
export interface CreatePostResponse {
  success: boolean;
  message: string;
  data: {
    postId: number;
    title: string;
    nickname: string;
    createdAt: string;
  };
}


export interface Author {
  memberId: number;
  nickname: string;
  profileImageUrl: string;
  badge: number;
}

export interface PostDetailData {
  post: Post;
  postImageUrls: string[];
  author: Author;
}

export interface PostDetailResponse {
  success: boolean;
  message: string;
  data: PostDetailData;
}

export interface CommentAuthor {
  memberId: number;
  nickname: string;
  profileImageUrl: string;
  badgeId: number;
}

export interface Comment {
  commentId: number;
  content: string;
  createdAt: string;
  isSecret: boolean;
  author: CommentAuthor;
}

export interface CommentPageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CommentResponseData {
  comments: Comment[];
  pageInfo: CommentPageInfo;
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: CommentResponseData;
}
