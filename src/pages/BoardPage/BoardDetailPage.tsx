import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import type { PostDetailData, Comment } from '../../types/Board';
import './BoardDetailPage.css';
import { BADGE_MAP } from '../../utils/badgeMap';
import lock from '../../assets/Board/lock.svg';
import send from '../../assets/homepage/Gradient_Arrow.svg';
//import { getPostDetail } from '../../api/boardDetail/postApi';
//import { getComments, createComment } from '../../api/boardDetail/comment';

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

  {
    comment_id: 3,
    content: '이건 비밀 댓글테스트하는 용도입니다',
    created_at: '2023-10-27T13:00:00',
    is_secret: true,
    author: {
      memberId: 4,
      nickname: '개발자D',
      profile_image_url: 'https://picsum.photos/seed/userD/40/40',
      badge_id: 0,
    },
  },
];
/* ============================================= */

const BoardDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();

  const [data, setData] = useState<PostDetailData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  /** 게시글 메뉴 */
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);

  /** 댓글 메뉴 */
  const [openCommentMenuId, setOpenCommentMenuId] = useState<number | null>(null);

  /** 댓글 입력 */
  const [commentText, setCommentText] = useState('');
  const [isSecret, setIsSecret] = useState(false);

  /** ref */
  const postMenuRef = useRef<HTMLDivElement | null>(null);
  const commentMenuRef = useRef<HTMLDivElement | null>(null);

  const [loginUserId, setLoginUserId] = useState<number>(1); // 로그인 사용자 설정

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [editingIsSecret, setEditingIsSecret] = useState(false);

  /* 실제 연동용 코드 */
  {/*
  useEffect(() => {
    if (!postId) return;
    const fetchData = async() => {
      try {
        setLoading(true);

        const postRes = await getPostDetail(Number(postId));
        if (postRes.success) {
          setData(postRes.data);
        }

        const commentRes = await getComments(Number(postId));
        if (commentRes.success) {
          setComments(commentRes.data.comments);
        }
      } catch(error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]); */}

  {/* 댓글 작성 기능 (MockData) */ }
  const handleCommentSubmitMock = () => {
  if (!commentText.trim()) return; // 빈 댓글 방지

  const newComment: Comment = {
    comment_id: 4, // 임시 ID
    content: commentText,
    created_at: new Date().toISOString(), // 현재 시간
    is_secret: isSecret,
    author: {
      memberId: 4, // 작성자 ID
      nickname: '가인', // 로그인 유저 이름
      profile_image_url: 'https://picsum.photos/seed/me/40/40', // 임시 이미지
      badge_id: 3, // 임시 뱃지
    },
  };

  // 기존 댓글 배열에 새 댓글 추가
  setComments([...comments, newComment]);

  // 입력칸 초기화
  setCommentText('');
  setIsSecret(false);
};

{/*댓글 작성 API 연동용 */}
{/*
const handleCommentSubmit = async () => {
  if (!commentText.trim() || !postId) return;

  try {
    const body = { content: commentText, is_secret: isSecret };
    const res = await createComment(Number(postId), body);

    if (res.success) {
      const commentRes = await getComments(Number(postId));
      if (commentRes.success) setComments(commentRes.data.comments);

      setCommentText('');
      setIsSecret(false);
    }
  } catch (error) {
    console.error(error);
  }
} */}

  
  {/* MockData용 */}
  useEffect(() => {
    setTimeout(() => {
      setData(MOCK_DATA);
      setComments(MOCK_COMMENTS);
      setLoading(false);
    }, 300);
  }, [postId]);

  /** 바깥 클릭 시 드롭다운 닫기 */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        isPostMenuOpen &&
        postMenuRef.current &&
        !postMenuRef.current.contains(target)
      ) {
        setIsPostMenuOpen(false);
      }

      if (
        openCommentMenuId !== null &&
        commentMenuRef.current &&
        !commentMenuRef.current.contains(target)
      ) {
        setOpenCommentMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPostMenuOpen, openCommentMenuId]);

  if (loading) return <div className="loading">로딩 중...</div>;
  if (!data) return <div className="error">게시글을 찾을 수 없습니다.</div>;

  const { post, author, post_image_urls } = data;
  const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};



  // mock 로그인 유저
  const isMyPost = author.memberId === loginUserId;

  return (
    <div className="board-detail-container">
      {/* ================= 게시글 ================= */}
      <section className="post-section">
        <h1 className="post-title">{post.title}</h1>

        <div className="post-header">
          <div className="author-info">
            <img src={author.profile_image_url} alt="프로필 이미지" className="profile-img" />
            <div className="meta-text">
              <div className="nickname-row">
                <span className="nickname">{author.nickname}</span>
                {BADGE_MAP[author.badge] && (
                  <img src={BADGE_MAP[author.badge]} alt="뱃지" className="badge-img" />
                )}
              </div>
              <span className="date">
                  {formatDate(post.created_at)}
              </span>
            </div>
          </div>

          <div className="header-right">
            <div className="comment-info">
              댓글 <span className="highlight">{comments.length}</span>
            </div>

            {isMyPost && (
              <div className="menu-wrapper">
                <button
                  className="more-btn"
                  onClick={() => setIsPostMenuOpen((prev) => !prev)}
                >
                  ⋮
                </button>

                {isPostMenuOpen && (
                  <div className="dropdown-menu" ref={postMenuRef}>
                    <button className="menu-item border-b">수정</button>
                    <button className="menu-item">삭제</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="post-content">
          {post_image_urls.map((url, idx) => (
            <div key={idx} className="content-image-box">
              <img src={url} alt="게시글 이미지" />
            </div>
          ))}
          <p className="text-body">{post.text_content}</p>
        </div>
      </section>

      {/* ================= 댓글 ================= */}
      <section className="comment-section">
        <h2 className="comment-title">
          댓글 <span className="count-grey">{comments.length}</span>
        </h2>
        
        {comments.map((comment) => {
          const isMyComment = loginUserId === comment.author.memberId;
          const isPostAuthor = loginUserId === author.memberId;

          const commentContent =
            comment.is_secret && !isMyComment && !isPostAuthor
            ? '비밀 댓글입니다.'
            : comment.content;
          
            const isEditing = editingCommentId === comment.comment_id;

          return (
          <div key={comment.comment_id} className="comment-item">
            <div className="user-info">
              <div className='user-left'>
              <img
                src={comment.author.profile_image_url}
                alt="댓글 작성자 이미지"
                className="profile-img"
              />
              <div className="nickname-badge-wrapper">
                <span className="nickname">
                  {comment.author.nickname}
                </span>

                {BADGE_MAP[comment.author.badge_id] && (
                  <img
                    src={BADGE_MAP[comment.author.badge_id]}
                    alt="작성자 뱃지"
                    className="badge-img"
                  />
                )}

                {comment.is_secret && (isMyComment || isPostAuthor) && (
                  <span className='secret-lock'>
                    <img src={lock} alt="자물쇠" className='lock-commentimg' />
                  </span>
                )}
                </div>
              </div>
                {isMyComment && (
                  <div className="menu-wrapper">
                    <button
                      className="more-btn-comment"
                      onClick={() =>
                        setOpenCommentMenuId((prev) =>
                          prev === comment.comment_id
                            ? null
                            : comment.comment_id
                        )
                      }
                    >
                      ⋮
                    </button>
                    {openCommentMenuId === comment.comment_id && (
                      <div className="dropdown-menu" ref={commentMenuRef}>
                        <button 
                          className="menu-item border-b"
                          onClick={() => {
                            setEditingCommentId(comment.comment_id);
                            setEditingCommentText(commentContent);
                            setEditingIsSecret(comment.is_secret);
                            setOpenCommentMenuId(null);
                          }}>수정</button>
                          <button className="menu-item">삭제</button>
                        </div>
                     )}
                    </div>
                )}
            </div>

            <div className="comment-content-area">
              {isEditing ? (
                <div className='editing-comment-box'>
                  <div className='editing-left'>
                    <input
                      className='comment-edit-field'
                      value={editingCommentText}
                      onChange={(e) => setEditingCommentText(e.target.value)}
                      placeholder='댓글 작성 칸 |'
                      title="수정 입력 창"
                    />
                    <div className={`lock-icon-wrapper ${editingIsSecret ? 'active': ''}`}
                      onClick={() => setEditingIsSecret(prev => !prev)}
                    >
                    <img src={lock} alt="좌물쇠" className='lock-img-edit' />
                  </div>
                </div>
                    <div className='editing-btn-group'>
                  <button
                    className='edit-save-btn'
                    onClick={() => {
                      setComments(
                        comments.map((c) => 
                          c.comment_id === editingCommentId
                            ? {...c, content: editingCommentText, is_secret: editingIsSecret}
                            : c
                          )
                      );
                      setEditingCommentId(null);
                    }}
                  >
                    저장
                  </button>
                  <button
                    className='edit-cancel-btn'
                    onClick={() => setEditingCommentId(null)}
                  > 취소 
                  </button>
                </div>


              </div>
              ) : (
                <p className='comment-text'>{comment.content}</p>
              )}
            </div>

            <hr className="comment-divider" />
          </div>
          );
      })}

      </section>

      {/* ================= 댓글 입력 ================= */}
      <div className="comment-input-container">
        <div className="comment-input-bar">
          <div className="input-left-group">
            <input
              className="comment-input-field"
              placeholder="댓글 작성 칸 |"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div
              className={`lock-icon-wrapper ${isSecret ? 'active' : ''}`}
              onClick={() => setIsSecret((prev) => !prev)}
            >
              <img src={lock} alt="자물쇠" className="lock-img" />
            </div>
          </div>

          <button className="comment-send-btn" onClick={handleCommentSubmitMock}>
            <img src={send} alt="전송버튼" className="send-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardDetailPage;
