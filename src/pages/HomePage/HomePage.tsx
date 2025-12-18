import React, { useRef, useState } from "react";
import "./HomePage.css";
import MainPageLogo from '../../assets/homepage/MainPageLogo.svg';
import SearchIcon from '../../assets/homepage/SearchIcon.svg';
import PlusButton from '../../assets/homepage/PlusButton.svg';
import GradientArrow from '../../assets/homepage/Gradient_Arrow.svg';
import BlackArrow from '../../assets/homepage/BlackArrow.svg';
import { mockBoardList } from '../../types/MainPagePostType';
import CommentIcon from '../../assets/homepage/HomePageCommentIcon.svg'
import BookmarkSection from "../../components/Bookmark/BookmarkSection";

const studyList = [
  { id: 1, title: "같이 시험 공부 해요", desc: " 설명 설명설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명설명 설명 설명 설명 설명 설명 설명 설명 설명설명 설명 설명 설명 설명 설명 설명", count: 239503, img: "https://images.unsplash.com/photo-1513258496099-48168024aec0", bg: "study-dark" },
  { id: 2, title: "A+ 가자", desc: "설명 설명 설명 설명 설명 설명 설명", count: 239503, img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f", bg: "study-gradient" },
  { id: 3, title: "cpa 뿌시자", count: 239503, img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f", bg: "study-gray" },
  { id: 4, title: "너무졸려", count: 233, bg: "study-dark" },
  { id: 5, title: "React 스터디", count: 500, bg: "study-gradient" },
  { id: 6, title: "JavaScript 마스터", count: 320, bg: "study-gray" }
];

const boardList = mockBoardList;
const HomePage: React.FC = () => {

  //임시로 mockData 사용
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  // 스터디 페이지네이션
  const [studyPage, setStudyPage] = useState(0);
  const studiesPerPage = 3;
  const studyPageCount = Math.ceil(studyList.length / studiesPerPage);

  

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

  return (
    <div className="homepage-content-wrapper">

      {/* ===== 1. 서브 네비게이션 ===== */}
      <nav className="sub-navigation">
        <a href="/" className="nav-link-home-link">홈</a>
        <span className="nav-divider">|</span>
        <a href="/study" className="nav-link">스터디</a>
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

            <input type="file" ref={fileInputRef} style={{display: "none"}} />
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
          {paginatedStudies.map((item) => (
            <div key={item.id} className={`study-card ${item.bg}`}>
              {item.img && <img src={item.img} alt="" className="study-card-img" />}
              <div className="study-card-content">
                <h3 className="study-card-title">{item.title}</h3>
                {item.desc && <p className="study-card-desc">{item.desc}</p>}
                <div className="study-card-footer">
                  <span className="study-card-count">{item.count.toLocaleString()} 명</span>
                  <div className="study-card-arrow">
                    {item.bg === 'study-dark' ? (
                      <img src={GradientArrow} alt="gradient arrow" />
                    ) : (
                      <img src={BlackArrow} alt="black arrow" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
          <button className="popular-board-more">더보기</button>
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
                  <span className="likes-count">{item.commentCount}</span>
                </span>
              </div>
            ))}
      
          </div>
      </div>

    </div>
  );
};

export default HomePage;
