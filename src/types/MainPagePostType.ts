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

//MockData
export const mockPopularPosts = [
  {
    postId: 100,
    type: "소통",
    title: "API 명세서 질문",
    nickname: "개발자B",
    created_at: "2023-10-26T15:00:00",
    comment_count: 5
  },
  {
    postId: 101,
    type: "소통",
    title: "ERD 설계 질문입니다",
    nickname: "개발자A",
    created_at: "2023-10-27T10:00:00",
    comment_count: 2
  },
  {
    postId: 102,
    type: "멘토",
    title: "React 공부법 질문",
    nickname: "개발자C",
    created_at: "2023-10-28T09:30:00",
    comment_count: 8
  },
  {
    postId: 103,
    type: "질문",
    title: "AWS 배포 문제",
    nickname: "개발자D",
    created_at: "2023-10-28T14:00:00",
    comment_count: 3
  },
  {
    postId: 104,
    type: "소통",
    title: "DB 인덱스 성능 개선",
    nickname: "개발자E",
    created_at: "2023-10-29T11:00:00",
    comment_count: 1
  },
  {
    postId: 105,
    type: "멘토",
    title: "프론트엔드 테스트 작성법",
    nickname: "개발자F",
    created_at: "2023-10-29T13:45:00",
    comment_count: 4
  },
  {
    postId: 106,
    type: "질문",
    title: "OAuth 로그인 구현",
    nickname: "개발자G",
    created_at: "2023-10-30T08:20:00",
    comment_count: 6
  },
  {
    postId: 107,
    type: "소통",
    title: "UI/UX 피드백 부탁",
    nickname: "개발자H",
    created_at: "2023-10-30T10:00:00",
    comment_count: 2
  },
  {
    postId: 108,
    type: "멘토",
    title: "TypeScript 학습 자료 공유",
    nickname: "개발자I",
    created_at: "2023-10-30T12:30:00",
    comment_count: 7
  },
  {
    postId: 109,
    type: "질문",
    title: "Next.js SSR 관련",
    nickname: "개발자J",
    created_at: "2023-10-31T09:00:00",
    comment_count: 5
  }
];
