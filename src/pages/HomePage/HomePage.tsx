import React, { useEffect, useRef, useState } from "react";
import "./HomePage.css";
import SearchIcon from '../../assets/homepage/SearchIcon.svg';
import GradientArrow from '../../assets/homepage/Gradient_Arrow.svg';
import BlackArrow from '../../assets/homepage/BlackArrow.svg';
import CommentIcon from '../../assets/homepage/HomePageCommentIcon.svg'
import BookmarkSection from "../../components/Bookmark/BookmarkSection";
import { getPopularStudies } from "../../api/HomePage/getPopularStudies";
import type {StudyPopularListItem} from '../../types/HomePageTypes';
import { useNavigate } from "react-router-dom";
import CTAbox from '../../components/HomePage/CTAbox';
import { api } from '../../api/client';
import MyStudyCarousel from "../StudyPage/MyStudyCarousel";
import { type StudyListItem } from "../StudyPage/StudyPage";
import StudyViewModal from "../StudyDetailPage/StudyViewModal";
import { type PopularPostsResponse, type PopularPost } from '../../types/MainPagePostType';
import LoginAlertModal from "../../components/AlertModal/LoginAlertModal";


const HomePage: React.FC = () => {

  const isLoggedIn = Boolean(localStorage.getItem('accessToken'));
  const [myStudies, setMyStudies] = useState<StudyListItem[]>([]);
  const [nickname, setNickname] = useState<string | undefined>();
  const [myMemberId, setMyMemberId] = useState<number | null>(null);
  const [myFilter, setMyFilter] = useState<string>("ALL");
  const [selectedStudyId, setSelectedStudyId] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 스터디 불러오기
  const [studyList, setStudyList] = useState<StudyPopularListItem[]>([]);
  const [studyPage, setStudyPage] = useState(0);
  const [studyPageCount, setStudyPageCount] = useState(0);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const bgClasses = ['study-dark', 'study-gradient', 'study-gray'];
  const handlePlusClick = () => setIsMenuOpen(prev => !prev);
  const handleCloseMenu = () => setIsMenuOpen(false);

  const [boardList, setBoardList] = useState<PopularPost[]>([]);
  const [boardLoading, setBoardLoading] = useState(true);



const handleStudyClick = (studyId: number) => {
  if (!isLoggedIn) {
    setShowLoginModal(true); // 로그인 모달 띄우기
    return;
  }
  setSelectedStudyId(studyId); // 로그인 되어 있으면 선택 처리
};

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchMemberInfo = async() => {
      try {
        const response = await api.get('/members/me/info');
        if (response.data.success) {
          setMyMemberId(response.data.data.memberId);
          setNickname(response.data.data.nickname);
        }
      } catch (error) {
        console.error('유저 정보 조회 실패', error);
      }
    };
    fetchMemberInfo();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchMyStudies = async () => {
      try {
        const response = await api.get("/studies/my", {
          params: {
            scope: 'ALL',
            page: 0,
          },
        }); // 나만의 스터디 API
        if (response.data.success) {
          setMyStudies(response.data.data.content);
        } else {
          setMyStudies([]);
        }
      } catch (error) {
        console.error("나만의 스터디 조회 실패", error);
        setMyStudies([])
      }
    };

    fetchMyStudies();
  }, [isLoggedIn]);

  
useEffect(() => {
  const fetchPopularStudy = async () => {
    try {
      const res = await getPopularStudies(studyPage);
      setStudyList(res.studies);
      setStudyPageCount(res.totalPages);
    } catch (err) {
      console.error('인기 스터디 조회 실패', err);
    }
  };
  fetchPopularStudy();
}, [studyPage])


useEffect(() => {
  const fetchPopularPosts = async () => {
    try {
      setBoardLoading(true);
      const res = await api.get<PopularPostsResponse>('/posts/popular', {
        params: { page: 0, size: 10 } // 0페이지, 10개
      });
      if (res.data.success) {
        setBoardList(res.data.data.posts);
      } else {
        setBoardList([]);
        console.error('인기 게시글 조회 실패:', res.data.message);
      }
    } catch (error) {
      console.error('인기 게시글 조회 중 오류 발생', error);
      setBoardList([]);
    } finally {
      setBoardLoading(false);
    }
  };

  fetchPopularPosts();
}, []);


  const handleOpenFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    handleCloseMenu();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setSelectedFileName(file.name)
    e.target.value = '';
  };

  const handleStudyPageClick = (pageIndex: number) => setStudyPage(pageIndex);

  const handleSearchClick = () => {
    if (!selectedFile) return;

    navigate('/chatroom', {
      state: {
        file: selectedFile,
      }
    })
  }


  return (
    <>
    <nav className="sub-navigation">
      <a href="/" className="nav-link-home-link">홈</a>
      <span className="nav-divider">|</span>
      <a href="/studies" className="nav-link">스터디</a>
      <span className="nav-divider">|</span>
      <a href="/board" className="nav-link">게시판</a>
    </nav>
    <div className="sub-nav-divider"></div>
    <div className="homepage-content-wrapper">

      {/* ===== 2. 메인 콘텐츠 ===== */}
      <div className="home-main-content">
       {myStudies.length > 0 && isLoggedIn ? (
        <MyStudyCarousel
          myStudies={myStudies}
          myFilter={myFilter}
          setMyFilter={setMyFilter}
          onOpenStudy={(id: number) => setSelectedStudyId(id)}
        />
      ) : (
        <CTAbox isLoggedIn={isLoggedIn} nickname={nickname} />
      )}

      {selectedStudyId !== null && (
        <StudyViewModal
          open={true}
          studyId={selectedStudyId}
          onClose={() => setSelectedStudyId(null)} // 모달 닫기
        />
      )}

        <div className="Ai-Container">
          <p className="Ai-Container-Title" onClick={() => { if(isLoggedIn) {navigate("/chatroom")}
            else {
              setShowLoginModal(true);
            }
          }}
          >
            <span style={{color: '#FA785B'}}>Ai</span>
            <span style={{color: '#000000'}}> 문서요약</span>
          </p>

          <div className="ai-input-box">
            <div className="home-plus-button" onClick={handlePlusClick}>+</div>
            <input className="ai-input" placeholder="| ex) 파일을 요약해줘" value={selectedFileName} readOnly />
            <button className="search-button" onClick={handleSearchClick}>
              <img src={SearchIcon} alt="search" />
            </button>

            {isMenuOpen && (
              <>
                <div className="popup-overlay" onClick={handleCloseMenu}></div>
                <div className="file-menu-popup">
                  <button onClick={() => {
                      if (isLoggedIn) {
                      handleOpenFilePicker();
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  >
                  파일 추가</button>
                </div>
              </>
            )}

            <input type="file" ref={fileInputRef} style={{display: "none"}} onChange={handleFileChange} title="파일"/>
          </div>
        </div>
      </div>

      {/* 북마크 섹션 */}
      {isLoggedIn && <BookmarkSection />}

      {/* ===== 인기 스터디 섹션 ===== */}
      <div className="popular-study-container">
        <div className="popular-study-header">
          <h2 className="popular-study-title">인기 스터디를 확인해보세요 !</h2>
          <button className="popular-study-more" onClick={() => navigate("/studies")}>더보기</button>
        </div>

        <div className="popular-study-grid">
          {studyList.map((item, index) => {
            const bgClass = bgClasses[index % bgClasses.length];
            return (
              <div key={item.studyId} className={`study-card ${bgClass}`} onClick={() => handleStudyClick(item.studyId)}
                style={{ cursor: 'pointer'}}>
                <img
                  src = {item.coverImage}
                  alt = {item.studyName}
                  className="study-card-img"
                />
                <div className="study-card-content">
                  <h3 className="study-card-title">{item.studyName}</h3>
                    {item.description && <p className="study-card-desc">{item.description}</p>}
                    <div className="study-card-footer">
                      <span className="study-card-count">{Number(item.memberNow).toLocaleString()} 명</span>
                      <div className="study-card-arrow">
                      {bgClass === 'study-dark' ? (
                      <img src={GradientArrow} alt="gradient arrow" />
                      ) : (
                        <img src={BlackArrow} alt="black arrow" />
                      )}
                  </div>
                </div>
              </div>
            </div>
          )
          })}
        </div>

        {/* 스터디 페이지네이션 DOT */}
        <div className="pagination-dots">
          {Array.from({ length: studyPageCount }).map((_, idx) => (
            <span
              key={idx}
              className={`dot ${studyPage === idx ? "active" : ""}`}
              onClick={() => handleStudyPageClick(idx)}
            />
          ))}
        </div>
      </div>
      <div className="divider-box2"></div>

      {/*인기 게시글 섹션 */}
      <div className="popular-board-container">
        <div className="popular-board-header">
          <h2 className="popular-board-title">인기 게시글</h2>
          <button
            className="popular-board-more"
            onClick={() => navigate('/board')}>더보기</button>
            </div>
            <div className="popular-board-grid">
              {boardLoading ? (
                <p>로딩중...</p>
              ) : (
                boardList.map(item => (
                  <div key={item.postId} className="board-item" onClick={() => navigate(`/board/${item.postId}`)}>
                    <span className={`board-tag ${
                      item.type === '소통' ? 'tag-communication' :
                      item.type === '멘토' ? 'tag-study' : 'tag-question'
                    }`}>
                      <span className="board-tag-text">{item.type}</span>
                    </span>
                    <p className="board-content">{item.title}</p>
                    <span className="board-likes">
                      <img src={CommentIcon} alt="댓글 아이콘" className="comment-icon-img"/>
                      <span className="likes-count">{item.commentCount}</span>
                    </span>
                  </div>
                ))
              )}
            </div>

          </div>
          <LoginAlertModal
              isOpen={showLoginModal}
              onClose={() => setShowLoginModal(false)}
              onLogin={() => navigate("/login")} // 로그인 버튼 누르면 로그인 페이지로 이동
          />

    </div>
    </>
  );
};

export default HomePage;
