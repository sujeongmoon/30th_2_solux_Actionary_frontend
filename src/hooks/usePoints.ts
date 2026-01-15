import { useState } from "react";
import api from "../api/client";

export type PointSource = "STUDY_TIME" | "STUDY_PARTICIPATION" | "TODO_COMPLETION";

export interface EarnPointResponse {
  success: boolean;
  message: string;
  data: {
    userId: number;
    earnedPoint: number;
    source: PointSource;
    totalPoint: number;
    todayStudySeconds?: number;
    studyRoomId?: number;
    todoId?: number;
    todayTodoPointCount?: number;
    todayTodoPointLimit?: number;
  };
}

export const usePoints = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [earnedPoint, setEarnedPoint] = useState<number | null>(null);

  /* 공부시간 포인트 적립 */
  const earnStudyTimePoints = async (accessToken: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.post<EarnPointResponse>(
        "/api/points/study-time",
        {},
        { headers: { Authorization: `Bearer ${accessToken}`}}
      );
      setEarnedPoint(res.data.data.earnedPoint);
      return res.data;
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "공부시간 포인트 적립 오류");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /* 스터디 참여 포인트 적립 */
  const earnStudyParticipationPoints = async (
    accessToken: string,
    userId: number,
    studyRoomId: number,
    participatedMinutes: number
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.post<EarnPointResponse>(
        "/api/points/study-participation",
        { userId, studyRoomId, participatedMinutes },
        { headers: {Authorization: `Bearer ${accessToken}`}}
      );
      setEarnedPoint(res.data.data.earnedPoint);
      return res.data;
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "스터디 참여 포인트 적립 오류");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /* 투두 완료 포인트 적립 */
  const earnTodoPoints = async (accessToken: string, userId: number, todoId: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.post<EarnPointResponse>(
        "/api/points/todos",
        { userId, todoId },
        { headers: { Authorization: `Bearer ${accessToken}`}}
      );
      setEarnedPoint(res.data.data.earnedPoint);
      return res.data;
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "투두 완료 포인트 적립 오류");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    errorMessage,
    earnedPoint,
    earnStudyTimePoints,
    earnStudyParticipationPoints,
    earnTodoPoints,
  };
};