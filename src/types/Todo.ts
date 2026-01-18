export interface CreateCategoryResponse {
  success: boolean;
  message: string;
  data: {
    categoryId: number;
    name: string;
    color: string;
    createdAt: string;
  };
}
