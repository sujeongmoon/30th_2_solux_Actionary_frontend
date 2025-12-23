import { api } from "./client";
import type { StudyListResponse, Visibility } from "../types/StudyType";

export async function getStudies(params: {
  visibility?: Visibility;
  category?: string;
  page?: number;
}) {
  const res = await api.get<StudyListResponse>("/api/studies", { params });
  return res.data;
}