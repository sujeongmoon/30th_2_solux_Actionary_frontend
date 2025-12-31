import React, { useRef, useState, /*useEffect*/ } from "react";
import "./HomePage.css";
import MainPageLogo from '../../assets/homepage/MainPageLogo.svg';
import SearchIcon from '../../assets/homepage/SearchIcon.svg';
import PlusButton from '../../assets/homepage/PlusButton.svg';
import GradientArrow from '../../assets/homepage/Gradient_Arrow.svg';
import BlackArrow from '../../assets/homepage/BlackArrow.svg';
import { mockPopularPosts } from '../../types/MainPagePostType';
import CommentIcon from '../../assets/homepage/HomePageCommentIcon.svg'
import BookmarkSection from "../../components/Bookmark/BookmarkSection";
//import { getPopularStudies } from "../../api/HomePage/getPopularStudies";
import { useNavigate } from "react-router-dom";

const studyList = [
  {
    studyId: 1,
    name: "자바 공부방",
    coverImage: "https://images.unsplash.com/photo-1513258496099-48168024aec0",
    description: "자바를 공부하는 방입니다.",
    count: 256
  },
  {
    studyId: 2,
    name: "A+ 가자",
    coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
    description: "시험 공부를 함께 하며 목표 달성!",
    count: 198
  },
  {
    studyId: 3,
    name: "CPA 뿌시자",
    coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
    description: "회계 공부 집중 스터디",
    count: 342
  },
  {
    studyId: 4,
    name: "React 스터디",
    coverImage: "",
    description: "React 기초부터 심화까지",
    count: 289
  },
  {
    studyId: 5,
    name: "토익 900점 목표방",
    coverImage: "",
    description: "토익900점 가자아아앗",
    count: 150
  }
];


const boardList = mockPopularPosts;
const HomePage: React.FC = () => {

  //임시로 mockData 사용
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  // 스터디 페이지네이션
  const studiesPerPage = 3;
  const studyPageCount = Math.ceil(studyList.length / studiesPerPage);

  // 스터디 불러오기
  //const [studyList, setStudyList] = useState([]);
  const [studyPage, setStudyPage] = useState(0);
  //const [studyPageCount, setStudyPageCount] = useState(0);

  {/*연동 시 주석 풀기*/}
  {/*useEffect(() => {
    const fetchPopularStudies = async () => {
      try {
        const res = await getPopularStudies(studyPage);
        if (res.success) {
          setStudyList(res.data.studies);
          setStudyPageCount(res.data.totalPages);
        } else {
          console.error('인기 스터디 조회 실패:', res.message);
        }
      } catch (error) {
        console.error('인기 스터디 조회 중 오류 발생:', error);
      }
  };
fetchPopularStudies();
}, [studyPage]); */}

const bgClasses = ['study-dark', 'study-gradient', 'study-gray'];
  

  const handlePlusClick = () => setIsMenuOpen(prev => !prev);
  const handleCloseMenu = () => setIsMenuOpen(false);
  const handleOpenFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
    handleCloseMenu();
  };

  const handleStudyPageClick = (pageIndex: number) => setStudyPage(pageIndex);


  const paginatedStudies = studyList.slice(
    studyPage * studiesPerPage,
    studyPage * studiesPerPage + studiesPerPage
  );

  const navigate = useNavigate();

  return (
    <div className="homepage-content-wrapper">

      {/* ===== 1. 서브 네비게이션 ===== */}
      <nav className="sub-navigation">
        <a href="/" className="nav-link-home-link">홈</a>
        <span className="nav-divider">|</span>
        <a href="/studies" className="nav-link">스터디</a>
        <span className="nav-divider">|</span>
        <a href="/board" className="nav-link">게시판</a>
      </nav>

      <div className="divider"></div>

      {/* ===== 2. 메인 콘텐츠 ===== */}
      <div className="home-main-content">
        <div className="cta-container">
          <div className="cta-plus-button">
            <img className="cta-plus-button-img" src={PlusButton} alt="플러스 버튼" />
          </div>
          <p className="cta-text">
            <img src={MainPageLogo} alt="Actionary Logo" className="cta-logo" /> 
            지금 로그인 하고, 나만의 스터디를 만들어보세요!
          </p>
        </div>

        <div className="Ai-Container">
          <p className="Ai-Container-Title">
            <span style={{color: '#FA785B'}}>Ai</span>
            <span style={{color: '#000000'}}> 문서요약</span>
          </p>

          <div className="ai-input-box">
            <div className="plus-button" onClick={handlePlusClick}>+</div>
            <input className="ai-input" placeholder="| ex) 파일을 요약해줘" />
            <button className="search-button">
              <img src={SearchIcon} alt="search" />
            </button>

            {isMenuOpen && (
              <>
                <div className="popup-overlay" onClick={handleCloseMenu}></div>
                <div className="file-menu-popup">
                  <button onClick={handleOpenFilePicker}>사진 및 파일 추가</button>
                </div>
              </>
            )}

            <input type="file" ref={fileInputRef} style={{display: "none"}}/>
          </div>
        </div>
      </div>

      {/* 북마크 섹션 */}
      <BookmarkSection />

      {/* ===== 인기 스터디 섹션 ===== */}
      <div className="popular-study-container">
        <div className="popular-study-header">
          <h2 className="popular-study-title">인기 스터디를 확인해보세요 !</h2>
          <button className="popular-study-more">더보기</button>
        </div>

        <div className="popular-study-grid">
          {paginatedStudies.map((item, index) => {
            const bgClass = bgClasses[index % bgClasses.length];
            return (
              <div key={item.studyId} className={`study-card ${bgClass}`}>
                {item.coverImage && <img src={item.coverImage} alt="" className="study-card-img" />}
                <div className="study-card-content">
                  <h3 className="study-card-title">{item.name}</h3>
                    {item.description && <p className="study-card-desc">{item.description}</p>}
                    <div className="study-card-footer">
                      <span className="study-card-count">{item.count.toLocaleString()} 명</span>
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
            {boardList.map(item => (
              <div key={item.postId} className="board-item">
                <span className = {`board-tag ${
                  item.type === '소통' ? 'tag-communication' : 
                  item.type === '멘토' ? 'tag-study' : 'tag-question'
                  }`}>
                    <span className="board-tag-text">{item.type}</span></span>
                <p className="board-content">{item.title}</p>
                <span className="board-likes">
                  <img src = {CommentIcon} alt="댓글 아이콘" className="comment-icon-img"/>
                  <span className="likes-count">{item.comment_count}</span>
                </span>
              </div>
            ))}
      
          </div>
      </div>

    </div>
  );
};

export default HomePage;
