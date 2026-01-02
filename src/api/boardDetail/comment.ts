import { api } from '../client';
import type { CommentResponse} from '../../types/Board';

export const getComments = async (
    postId: number,
    page = 0,
    size = 10,
) => {
    const res = await api.get<CommentResponse>(
        `/api/posts/${postId}/comments`,
        {
            params: { page, size},
        }
    );
    return res.data;
}

interface CreateCommentRequest {
    content: string;
    is_secret: boolean;
}

export const createComment = async (
    postId: number,
    body: CreateCommentRequest
) => {
    const res = await api.post(`/api/posts/$${postId}/comments`, body);
    return res.data;
};