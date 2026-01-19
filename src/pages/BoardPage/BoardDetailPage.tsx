import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CommentResponse, PostDetailData } from '../../types/Board';
import './BoardDetailPage.css';
import { badgeMap } from '../../utils/badgeMap';
import lock from '../../assets/Board/lock.svg';
import unlock from '../../assets/Board/unlock.svg';
import send from '../../assets/homepage/Gradient_Arrow.svg';
import { getPostDetail, deletePost, getMyInfo } from '../../api/boardDetail/postApi';
import { getComments, createComment, deleteComment, updateComment } from '../../api/boardDetail/comment';
import { useNavigate } from 'react-router-dom'
import LoginAlertModal from '../../components/AlertModal/LoginAlertModal';
import Pagination from '../../components/Pagination/Pagination';

/* ============================================= */

const BoardDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const accessToken = localStorage.getItem('accessToken');
  const isLoggedIn = Boolean(accessToken);

  /** 게시글 메뉴 */
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
  /** 댓글 메뉴 */
  const [openCommentMenuMap, setOpenCommentMenuMap] = useState<{ [id: number]: boolean }>({});
  const [commentPage, setCommentPage] = useState(0);


  /** 댓글 입력 */
  const [commentText, setCommentText] = useState('');
  const [isSecret, setIsSecret] = useState(false);

  /** ref */
  const postMenuRef = useRef<HTMLDivElement | null>(null);

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [editingIsSecret, setEditingIsSecret] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

   /* ================= Query ================= */
  /** 내 정보  **/

  const { data: myInfo } = useQuery({
    queryKey: ['myInfo'],
    queryFn: getMyInfo,
    enabled: isLoggedIn,
  })

  const myMemberId = myInfo?.data?.memberId ?? null;

  /* 게시글 상세 조회 */
  const { data: postData, isLoading, isError} = useQuery<PostDetailData>({
    queryKey: ['postDetail', postId],
    queryFn: () => getPostDetail(Number(postId)).then(res => res.data),
    enabled: !!postId,
  })


  const { data: commentResponse } = useQuery<CommentResponse>({
  queryKey: ['comments', postId, commentPage],
  queryFn: () => getComments(Number(postId), commentPage, 10),
});
const comments = commentResponse?.data.comments ?? [];
  const pageInfo = commentResponse?.data.pageInfo;


  /* ==================== Mutaion ================== */

  const createCommentMutation = useMutation({
    mutationFn: ({ content, isSecret} : {content: string; isSecret: boolean }) =>
      createComment(Number(postId), {content, isSecret}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId]});
      setCommentText('');
      setIsSecret(false);
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => 
      deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId ]});
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({
      commentId, payload, }: {
        commentId: number;
        payload: Partial<{ content: string; isSecret: boolean }>;
      }) => 
        updateComment(Number(postId), commentId, payload, accessToken!),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        setEditingCommentId(null);
      }
    });

    const deletePostMutation = useMutation({
      mutationFn: (postId: number) => deletePost(postId),
      onSuccess: () => {
        alert('게시글이 삭제되었습니다.');
        navigate('/posts');
      },

      onError: (error) => {
        console.error(error);
        alert('게시글 삭제에 실패했습니다.')
      }
    });

    /* ============== Handler =============== */

    const handleCommentSubmit = () => {
      if (!isLoggedIn) {
        setShowLoginModal(true);
        return;
      }
      if (!commentText.trim()) return;

      createCommentMutation.mutate({
        content: commentText,
        isSecret,
      });
    };

    const handleEditCommentSave = () => {
      if (!editingCommentId) return;
      updateCommentMutation.mutate({
        commentId: editingCommentId,
        payload: {
          content: editingCommentText,
          isSecret: editingIsSecret,
        },
      });
    };
  
    if (isLoading) return <div className="loading">로딩 중...</div>;
    if (isError || !postData) return <div className="error">게시글을 찾을 수 없습니다.</div>;

    const { post, author, postImageUrls } = postData;
    const isMyPost = isLoggedIn && myMemberId === author.memberId;



  const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

  const navigateToProfile = (memberId: number) => {
    if (!isLoggedIn) return setShowLoginModal(true); // 로그인 안 했으면 로그인 모달
    if (memberId === myMemberId) navigate('/mypage'); // 자기 글이면 내 마이페이지
    else navigate(`/mypage/${memberId}`); // 타인 글이면 공개용 마이페이지
  };



  return (
    <div className="board-detail-container">
      {/* ================= 게시글 ================= */}
      <section className="post-section">
        <h1 className="post-title">{post.title}</h1>

        <div className="post-header">
          <div className="author-info">
            <img src={author.profileImageUrl} alt="프로필 이미지" className="profile-img"
              onClick={() => navigateToProfile(author.memberId)} />
            <div className="meta-text">
              <div className="nickname-row">
                <span className="nickname">{author.nickname}</span>
                {badgeMap[author.badge] && (
                  <img src={badgeMap[author.badge]} alt="뱃지" className="badge-img" />
                )}
              </div>
              <span className="date">
                  {formatDate(post.createdAt)}
              </span>
            </div>
          </div>

          <div className="header-right">
            <div className="comment-info">
              댓글 <span className="highlight">{pageInfo?.totalElements ?? 0}</span>
            </div>

            {isMyPost && (
              <div className="menu-wrapper">
                <button
                  className="more-btn"
                  onClick={() => {
                    setIsPostMenuOpen(prev => !prev);
                  }}
                >
                  ⋮
                </button>

                {isPostMenuOpen && (
                  <div className="dropdown-menu" ref={postMenuRef}>
                    <button className="menu-item border-b"
                      onClick={() => navigate(`/posts/edit/${post.postId}`)}>수정</button>
                    <button 
                      className="menu-item"
                      onClick={async () => {
                        if(!window.confirm('정말로 게시글을 삭제하시겠습니까?')) return;
                        deletePostMutation.mutate(post.postId);
                      }}
                        >삭제</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="post-content">
          {postImageUrls.map((url, idx) => (
            <div key={idx} className="content-image-box">
              <img src={url} alt="게시글 이미지" />
            </div>
          ))}
          <div
            className='text-body'>
              {post.textContent}
            </div>
        </div>


      </section>

      {/* ================= 댓글 ================= */}
      <section className="comment-section">
        <h2 className="comment-title">
          댓글 <span className="count-grey">{pageInfo?.totalElements ?? 0}</span>
        </h2>
        
        {comments.map((comment) => {
          const isMyComment = isLoggedIn && myMemberId === comment.author.memberId;
          const isPostAuthor = myMemberId === author.memberId;

          const commentContent =
            comment.isSecret && !isMyComment && !isPostAuthor
            ? '비밀 댓글입니다.'
            : comment.content;
          
            const isEditing = editingCommentId === comment.commentId;

          return (
          <div key={comment.commentId} className="comment-item">
            <div className="user-info">
              <div className='user-left'>
              <img
                src={comment.author.profileImageUrl}
                alt="댓글 작성자 이미지"
                className="profile-img"
                onClick={() => navigateToProfile(comment.author.memberId)}
              />
              <div className="nickname-badge-wrapper">
                <span className="nickname">
                  {comment.author.nickname}
                </span>

                {badgeMap[comment.author.badgeId] && (
                  <img
                    src={badgeMap[comment.author.badgeId]}
                    alt="작성자 뱃지"
                    className="badge-img"
                  />
                )}

                {comment.isSecret  && (
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
                      onClick= {() => {
                        setOpenCommentMenuMap(prev => ({
                          ...prev,
                          [comment.commentId]: !prev[comment.commentId]
                        }));
                      }}
                    >
                      ⋮
                    </button>
                    {openCommentMenuMap[comment.commentId] && (
                      <div className="dropdown-menu">
                        <button 
                          className="menu-item border-b"
                          onClick={() => {
                            setEditingCommentId(comment.commentId);
                            setEditingCommentText(commentContent);
                            setEditingIsSecret(comment.isSecret);
                          }}>수정</button>
                          <button 
                            className="menu-item"
                            onClick={() => {
                              deleteCommentMutation.mutate(comment.commentId);
                            }}>삭제</button>
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
                    <img 
                      src={editingIsSecret ? lock : unlock} alt="좌물쇠" className='lock-img-edit' />
                  </div>
                </div>
                    <div className='editing-btn-group'>
                  <button
                    className='edit-save-btn'
                    onClick={handleEditCommentSave}
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
                <p className='comment-text'>{commentContent}</p>
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
              <img 
                src={isSecret ? lock : unlock} 
                alt="자물쇠" 
                className="lock-img" />
            </div>
          </div>

          <button className="comment-send-btn" onClick={handleCommentSubmit}>
            <img src={send} alt="전송버튼" className="send-icon" />
          </button>
        </div>
      </div>
      {pageInfo && pageInfo.totalPages > 1 && (
        <div className='psd-pagination-wrapper'>
        <Pagination
          currentPage={pageInfo.page + 1} // UI는 1부터
          totalPages={pageInfo.totalPages}
          onPageChange={(page) => setCommentPage(page - 1)} // API는 0부터
        />
        </div>
      )}

      {showLoginModal && (
      < LoginAlertModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {                       // 로그인 버튼 눌렀을 때
        setShowLoginModal(false);              // 모달 닫기
        navigate('/login');                     // 로그인 페이지로 이동
      }}
      />
)}

    </div>
  );
};

export default BoardDetailPage;