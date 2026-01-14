import { api } from '../api/client';

export interface AddStudyTimeRequest {
  date: string;
  durationSecond: number;
}

export interface AddStudyTimeResponse {
  success: boolean;
  message: string;
  data: {
    studyTimeManualId: number;
    manualDate: string;
    duration_second: number;
    userId: number;
  };
}

export const addStudyTimeManual = async (
  payload: AddStudyTimeRequest
): Promise<AddStudyTimeResponse> => {
  const response = await api.post('/studytimes', payload);
  return response.data;
};
