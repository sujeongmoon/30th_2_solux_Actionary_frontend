import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { getPostDetail } from '../../api/boardDetail/postApi';
import type { PostDetailData, Comment } from '../../types/Board';
import './BoardDetailPage.css';
import { BADGE_MAP } from '../../utils/badgeMap';

/* ================= MOCK DATA ================= */
const MOCK_DATA: PostDetailData = {
  post: {
    postId: 101,
    type: '질문',
    title: 'ERD 설계 질문입니다',
    text_content: '게시글 본문 내용입니다. UI 확인용 mock 데이터입니다.',
    comment_count: 2,
    created_at: '2023-10-27T10:00:00',
  },
  post_image_urls: [
    'https://picsum.photos/seed/board1/600/400',
    'https://picsum.photos/seed/board2/600/400',
  ],
  author: {
    memberId: 1,
    nickname: '개발자A',
    profile_image_url: 'https://picsum.photos/seed/profile/80/80',
    badge: 0,
  },
};

const MOCK_COMMENTS: Comment[] = [
  {
    comment_id: 1,
    content: '좋은 질문입니다.',
    created_at: '2023-10-27T11:00:00',
    is_secret: false,
    author: {
      memberId: 2,
      nickname: '개발자B',
      profile_image_url: 'https://picsum.photos/seed/userB/40/40',
      badge_id: 1,
    },
  },
  {
    comment_id: 2,
    content: '저도 궁금했어요!',
    created_at: '2023-10-27T12:00:00',
    is_secret: false,
    author: {
      memberId: 3,
      nickname: '개발자C',
      profile_image_url: 'https://picsum.photos/seed/userC/40/40',
      badge_id: 2,
    },
  },
];
/* ============================================= */

const BoardDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const [data, setData] = useState<PostDetailData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /* ================= 실제 API 연동 ================= */
    /*
    if (postId) {
      getPostDetail(Number(postId))
        .then((res) => {
          if (res.data.success) {
            setData(res.data.data);
            setComments(res.data.data.comments);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
    */
    /* =============================================== */

    // ✅ UI 개발용 mock 데이터
    setTimeout(() => {
      setData(MOCK_DATA);
      setComments(MOCK_COMMENTS);
      setLoading(false);
    }, 300);
  }, [postId]);

  if (loading) return <div className="loading">로딩 중...</div>;
  if (!data) return <div className="error">게시글을 찾을 수 없습니다.</div>;

  const { post, author, post_image_urls } = data;
  const formattedDate = post.created_at.split('T')[0].replace(/-/g, '/');

  // 🔥 나중에 auth에서 가져오기
  const loginUserId = 1;
  const isMyPost = author.memberId === loginUserId;

  return (
    <div className="board-detail-container">
      {/* 게시글 섹션 */}
      <section className="post-section">
        <h1 className="post-title">{post.title}</h1>

        <div className="post-header">
          <div className="author-info">
            <img
              src={author.profile_image_url}
              alt="profile"
              className="profile-img"
            />
            <div className="meta-text">
              <div className="nickname-row">
                <span className="nickname">{author.nickname}</span>
                {BADGE_MAP[author.badge] && (
                  <img
                    src={BADGE_MAP[author.badge]}
                    alt="badge"
                    className="badge-img"
                  />
                )}
              </div>
              <span className="date">{formattedDate}</span>
            </div>
          </div>

          <div className="header-right">
            <div className="comment-info">
              댓글 <span className="highlight">{post.comment_count}</span>
            </div>

            {isMyPost && (
              <div className="menu-wrapper">
                <button
                  className="more-btn"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  ⋮
                </button>

                {isMenuOpen && (
                  <div className="dropdown-menu">
                    <button className="menu-item border-b">수정</button>
                    <button className="menu-item">삭제</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <hr className="divider" />

        <div className="post-content">
          {post_image_urls.length > 0 &&
            post_image_urls.map((url, index) => (
              <div key={index} className="content-image-box">
                <img src={url} alt="post content" />
              </div>
            ))}
          <p className="text-body">{post.text_content}</p>
        </div>
      </section>

      <hr className="divider" />

      {/* 댓글 섹션 */}
      <section className="comment-section">
        <h2 className="comment-title">
          댓글 <span className="count-grey">{comments.length}</span>
        </h2>

        <div className="comment-list">
          {comments.map((comment) => {

            return (
              <div key={comment.comment_id} className="comment-item">
                <div className="user-info">
                  <img
                    src={comment.author.profile_image_url}
                    alt="profile"
                    className="profile-img"
                  />
                  <div className="nickname-badge-wrapper">
                      <span className="nickname">{comment.author.nickname}</span>
                      {BADGE_MAP[comment.author.badge_id] && (
                        <img
                          src={BADGE_MAP[comment.author.badge_id]}
                          alt="badge"
                          className="badge-img"
                        />
                      )}
                  </div>
                </div>
                {/* 댓글 본문 내용*/}
                <div className='comment-content-area'>
                  <p className='comment-text'>{comment.content}</p>
              </div>

              <hr className='comment-divider' />
            </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default BoardDetailPage;
