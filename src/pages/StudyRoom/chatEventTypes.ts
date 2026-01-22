export type ChatEventType =
  | "CHAT_MESSAGE"
  | "NOW_STATE_CHANGED"
  | "PARTICIPANT_JOINED"
  | "PARTICIPANT_LEFT"
  | "WEBRTC_SIGNAL"; 

// 1. 채팅 메시지 
export type ChatMessageData = {
  studyParticipantId: number;
  studyId: number;
  senderId: number;        
  senderNickname: string;  
  badgeId?: number;
  badgeImageUrl?: string;
  chat: string;            
};

// 2. 상태 변경 
export type NowStateChangedData = {
  studyParticipantId: number;
  studyId: number;
  userId: number;
  nowState: string;        
};

// 3. 입장
export type ParticipantJoinedData = {
  studyParticipantId: number;
  studyId: number;
  userId: number;
  userNickname: string;
  profileImageUrl?: string;
  badgeId?: number;
  badgeImageUrl?: string;
};

// 4. 퇴장 
export type ParticipantLeftData = {
  studyParticipantId: number;
  studyId: number;
};

// 5. 화상 신호 
export type WebRTCSignalData = {
  type: "OFFER" | "ANSWER" | "ICE";
  senderId: number;
  targetId?: number; 
  sdp?: any;
  candidate?: any;
};


export type ChatEvent =
  | { type: "CHAT_MESSAGE"; data: ChatMessageData }
  | { type: "NOW_STATE_CHANGED"; data: NowStateChangedData }
  | { type: "PARTICIPANT_JOINED"; data: ParticipantJoinedData }
  | { type: "PARTICIPANT_LEFT"; data: ParticipantLeftData }
  | { type: "WEBRTC_SIGNAL"; data: WebRTCSignalData };