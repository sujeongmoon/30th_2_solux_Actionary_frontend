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

export const updateComment = async (
    postId: number,
    commentId: number,
    data: { content: string; is_secret: boolean },
    token: string
) => {
    try {
        const res = await api.patch(`/api/posts/${postId}/comments/${commentId}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type' : 'application/json',
                },
            }
        );
        
        return res.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};