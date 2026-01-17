import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import type { PostDetailData, Comment } from '../../types/Board';
import './BoardDetailPage.css';
import { badgeMap } from '../../utils/badgeMap';
import lock from '../../assets/Board/lock.svg';
import unlock from '../../assets/Board/unlock.svg';
import send from '../../assets/homepage/Gradient_Arrow.svg';
import { getPostDetail, deletePost } from '../../api/boardDetail/postApi';
import { getComments, createComment, deleteComment, updateComment } from '../../api/boardDetail/comment';
import { useNavigate } from 'react-router-dom'
import LoginAlertModal from '../../components/AlertModal/LoginAlertModal';
import { getMyInfo } from '../../api/boardDetail/postApi';

/* ============================================= */

const BoardDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PostDetailData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  /** 게시글 메뉴 */
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);

  /** 댓글 메뉴 */
  const [openCommentMenuMap, setOpenCommentMenuMap] = useState<{ [id: number]: boolean }>({});

  /** 댓글 입력 */
  const [commentText, setCommentText] = useState('');
  const [isSecret, setIsSecret] = useState(false);

  /** ref */
  const postMenuRef = useRef<HTMLDivElement | null>(null);

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [editingIsSecret, setEditingIsSecret] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const accessToken = localStorage.getItem('accessToken');
  const isLoggedIn = Boolean(accessToken);

  const [myMemberId, setMyMemberId] = useState<number | null>(null);


  // 유저 정보 가져오기
useEffect(() => {
  const fetchMyInfo = async () => {
    const res = await getMyInfo();
    if(res.success) {
      setMyMemberId(res.data.memberId); // 서버에서 받은 내 memberId
    }
  }
  fetchMyInfo();
}, []);


  /* 실제 연동용 코드 */
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
  }, [postId]);

{/*댓글 작성 API 연동용 */}

const handleCommentSubmit = async () => {

  if (!isLoggedIn) {
    setShowLoginModal(true);
    return;
  }
  if (!commentText.trim() || !postId) return;

  try {
    const body = { content: commentText, isSecret: isSecret };
    const res = await createComment(Number(postId), body);

    if (res.success) {
      const commentRes = await getComments(Number(postId));
      if (commentRes.success) setComments(commentRes.data.comments);

      setCommentText('');
      setIsSecret(false);
    }
  } catch (error) {
    console.error(error);
    alert('댓글 작성에 실패했습니다')
  }
} 

  const handleDeleteComment = async (commentId: number, postId: number) => {
    try {
      await deleteComment(postId,commentId);

      setComments((prev) => 
        prev.filter((comment) => comment.commentId !== commentId)
    );
    } catch(error) {
      console.error(error);
      alert('댓글 삭제에 실패했습니다.');
    }
  }; 


  

  const handleEditCommentSave = async () => {
  if (!editingCommentId || !postId) return;
  if (!isLoggedIn) {
    setShowLoginModal(true);
    return;
  }

  try {
    const token = accessToken!;
    const originalComment = comments.find(c => c.commentId === editingCommentId);
    if (!originalComment) return;

    const payload: Partial<{ content: string; isSecret: boolean }> = {};
    if (editingCommentText !== originalComment.content) {
      payload.content = editingCommentText;
    }
    if (editingIsSecret !== originalComment.isSecret) {
      payload.isSecret = editingIsSecret;
    }

    // payload가 비어있으면 API 호출 안 해도 됨
    if (Object.keys(payload).length > 0) {
      await updateComment(Number(postId), editingCommentId, payload, token);
    }

    // 상태 갱신
    setComments(prev =>
      prev.map(c =>
        c.commentId === editingCommentId
          ? { ...c, ...payload }
          : c
      )
    );

    setEditingCommentId(null);

  } catch (error) {
    console.error(error);
    alert('댓글 수정에 실패했습니다.');
  }
};




 
  /** 바깥 클릭 시 드롭다운 닫기 */

  if (loading) return <div className="loading">로딩 중...</div>;
  if (!data) return <div className="error">게시글을 찾을 수 없습니다.</div>;

  const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

    const { post, author, postImageUrls } = data;
    console.log('postImageUrls:', postImageUrls);


  // 게시글 작성자가 나인지 체크
  const isMyPost = isLoggedIn && myMemberId !== null && author.memberId === myMemberId;


  return (
    <div className="board-detail-container">
      {/* ================= 게시글 ================= */}
      <section className="post-section">
        <h1 className="post-title">{post.title}</h1>

        <div className="post-header">
          <div className="author-info">
            <img src={author.profileImageUrl} alt="프로필 이미지" className="profile-img" />
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
              댓글 <span className="highlight">{comments.length}</span>
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
                      onClick={() => navigate(`/board/edit/${post.postId}`)}>수정</button>
                    <button 
                      className="menu-item"
                      onClick={async () => {
                        if(!window.confirm('정말로 게시글을 삭제하시겠습니까?')) return;

                        try {
                          // 실제 연동용
                          const res = await deletePost(post.postId);
                          if (!res.success) throw new Error('삭제 실패');
                          alert('게시글이 삭제되었습니다.');
                          navigate('/board');
                        } catch (error) {
                          console.error(error);
                          alert('게시글 삭제에 실패했습니다.');
                        }
                      }}>삭제</button>
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
          댓글 <span className="count-grey">{comments.length}</span>
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
                              handleDeleteComment(Number(postId), comment.commentId);
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