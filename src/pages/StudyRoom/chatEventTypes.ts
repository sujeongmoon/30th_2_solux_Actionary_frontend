// chatEventTypes.ts

/* [명세서 반영]
  - CHAT_MESSAGE.pdf [cite: 4, 7-19]
  - NOW_STATE_CHANGED.pdf [cite: 32, 34-41]
*/

export type ChatEventType =
  | "CHAT_MESSAGE"
  | "NOW_STATE_CHANGED"
  | "PARTICIPANT_JOINED"
  | "PARTICIPANT_LEFT"
  | "NOT_STUDY_PARTICIPANT";

// 1. 채팅 메시지 데이터 (data 객체 내부)
export type ChatMessageData = {
  studyParticipantId: number;
  studyId: number;
  senderId: number;        // 보낸 유저 ID (userId)
  senderNickname: string;  // 닉네임
  badgeId: number;
  badgeImageUrl: string;
  chat: string;            // 메세지 내용 (message -> chat)
};

// 2. 상태 변경 데이터
export type NowStateChangedData = {
  studyParticipantId: number;
  studyId: number;
  userId: number;
  nowState: string;        // 상태 내용 (state -> nowState)
};

// 3. 입장/퇴장 (기존 유지, 필요시 명세에 맞춰 수정)
export type ParticipantJoinedData = {
  studyParticipantId: number;
  nickname: string;
};

export type ParticipantLeftData = {
  studyParticipantId: number;
};

// 4. 전체 이벤트 타입 정의
export type ChatEvent =
  | { 
      type: "CHAT_MESSAGE"; 
      data: ChatMessageData; 
      createdAt: string; // createdAt은 data 밖에 위치 [cite: 18]
    }
  | { 
      type: "NOW_STATE_CHANGED"; 
      data: NowStateChangedData; 
      // createdAt 명세 없음, 필요시 추가
    }
  | { type: "PARTICIPANT_JOINED"; data: ParticipantJoinedData }
  | { type: "PARTICIPANT_LEFT"; data: ParticipantLeftData }
  | { type: "NOT_STUDY_PARTICIPANT"; data: string }; // 에러 메시지는 string일 수 있음 [cite: 27]