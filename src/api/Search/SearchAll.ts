import { api } from '../client';
import { type SearchPostItem } from './SearchPost';
import { type SearchStudyItemComponent } from './SearchStudy';

export interface AllSearchResponse {
  success: boolean;
  message: string;
  data: {
    studies: SearchStudyItemComponent[];
    posts: SearchPostItem[];
  };
}

export const searchAll = (keyword: string) => {
  return api.get<AllSearchResponse>('/search', {
    params: {
      q: keyword,
    },
  });
};
