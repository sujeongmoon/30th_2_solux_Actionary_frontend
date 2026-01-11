export interface SearchStudyItemComponent {
  studyId: number;
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string | null;
  isJoined: boolean;
  createdAt: string;
}
