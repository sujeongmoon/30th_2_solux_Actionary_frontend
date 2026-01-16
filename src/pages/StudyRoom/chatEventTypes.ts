export type ChatEventType =
  | "CHAT_MESSAGE"
  | "NOW_STATE_CHANGED"
  | "PARTICIPANT_JOINED"
  | "PARTICIPANT_LEFT"
  | "NOT_STUDY_PARTICIPANT";


export type ChatMessageData = {
  studyParticipantId: number;
  nickname: string;
  message: string;
  createdAt: string;
};

export type ParticipantJoinedData = {
  studyParticipantId: number;
  nickname: string;
};

export type ParticipantLeftData = {
  studyParticipantId: number;
};

export type NowStateChangedData = {
  studyParticipantId: number;
  state: "STUDY" | "REST";
};


export type ChatEvent =
  | { type: "CHAT_MESSAGE"; data: ChatMessageData }
  | { type: "PARTICIPANT_JOINED"; data: ParticipantJoinedData }
  | { type: "PARTICIPANT_LEFT"; data: ParticipantLeftData }
  | { type: "NOW_STATE_CHANGED"; data: NowStateChangedData }
  | { type: "NOT_STUDY_PARTICIPANT"; data: null };