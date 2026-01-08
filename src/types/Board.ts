export interface Post {
  postId: number;
  type: string;
  title: string;
  text_content: string;
  comment_count: number;
  created_at: string;
}

export interface Author {
  memberId: number;
  nickname: string;
  profile_image_url: string;
  badge: number;
}

export interface PostDetailData {
  post: Post;
  post_image_urls: string[];
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
  profile_image_url: string;
  badge_id: number;
}

export interface Comment {
  comment_id: number;
  content: string;
  created_at: string;
  is_secret: boolean;
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
