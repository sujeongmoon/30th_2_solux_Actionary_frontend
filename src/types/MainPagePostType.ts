export interface PopularPostItem {
    postId: number;
    type: '소통' | '멘토' | '질문';
    title: string;
    commentCount:number;
}

//MockData
export const mockBoardList: PopularPostItem[] = [
    // 왼쪽 열 (1~5번)
    { postId: 110, type: "소통", title: "이거 언제 해결될지 힘들지", commentCount: 12 },
    { postId: 109, type: "멘토", title: "10시간 공부 인증합니다", commentCount: 12 },
    { postId: 108, type: "질문", title: "이거 어떻게? 아는사람", commentCount: 8 },
    { postId: 107, type: "질문", title: "이거 어떻게? 아는사람", commentCount: 12 },
    { postId: 106, type: "질문", title: "이거 어떻게? 아는사람", commentCount: 12 },
    
    // 오른쪽 열 (6~10번)
    { postId: 105, type: "소통", title: "인생 이거 맞나", commentCount: 12 },
    { postId: 104, type: "멘토", title: "10시간 공부 인증합니다", commentCount: 12 },
    { postId: 103, type: "질문", title: "시험장에 에어컨 잘 나오나요", commentCount: 12 },
    { postId: 102, type: "질문", title: "시험장에 에어컨 잘 나오나요", commentCount: 12 },
    { postId: 101, type: "질문", title: "시험장에 에어컨 잘 나오나요", commentCount: 12 },
];