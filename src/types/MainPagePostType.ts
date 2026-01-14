// 인기 게시글 타입 정의

export interface PopularPost {
  postId: number;
  type: "소통" | "멘토" | "질문"; // 실제 API에 맞게
  title: string;
  nickname: string;
  createdAt: string;
  commentCount: number;
}

export interface PopularPostsResponse {
  success: boolean;
  message: string;
  data: {
    posts: PopularPost[];
    pageInfo: {
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
    };
  };
}

