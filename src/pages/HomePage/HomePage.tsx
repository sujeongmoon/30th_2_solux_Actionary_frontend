import React, { useRef, useState } from "react";
import "./HomePage.css";
import MainPageLogo from '../../assets/MainPageLogo.svg';
import SearchIcon from '../../assets/SearchIcon.svg';
import PlusButton from '../../assets/PlusButton.svg';
import BookmarkPlus from '../../assets/BookmarkPlus.svg';
import TrashCan from '../../assets/TrashCan.svg';
import LinkImg from '../../assets/LinkImg.svg';
import GradientArrow from '../../assets/Gradient_Arrow.svg';
import BlackArrow from '../../assets/BlackArrow.svg';

/* 더미 데이터 */
const mockBookmarks = Array(27).fill({
  bookmarkId: 1,
  name: '이름이름이름',
  link: "링크"
}).map((item, index) => ({ ...item, id: index }));

const studyList = [
  { id: 1, title: "같이 시험 공부 해요", desc: " 설명 설명설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명설명 설명 설명 설명 설명 설명 설명 설명 설명설명 설명 설명 설명 설명 설명 설명", count: 239503, img: "https://images.unsplash.com/photo-1513258496099-48168024aec0", bg: "study-dark" },
  { id: 2, title: "A+ 가자", desc: "설명 설명 설명 설명 설명 설명 설명", count: 239503, img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f", bg: "study-gradient" },
  { id: 3, title: "cpa 뿌시자", count: 239503, img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f", bg: "study-gray" },
  { id: 4, title: "너무졸려", count: 233, bg: "study-dark" },
  { id: 5, title: "React 스터디", count: 500, bg: "study-gradient" },
  { id: 6, title: "JavaScript 마스터", count: 320, bg: "study-gray" }
];

const HomePage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 북마크 페이지네이션
  const [bookmarkPage, setBookmarkPage] = useState(0);
  const bookmarksPerPage = 9;
  const bookmarkPageCount = Math.ceil(mockBookmarks.length / bookmarksPerPage);

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

  const handleBookmarkPageClick = (pageIndex: number) => setBookmarkPage(pageIndex);
  const handleStudyPageClick = (pageIndex: number) => setStudyPage(pageIndex);

  const paginatedBookmarks = mockBookmarks.slice(
    bookmarkPage * bookmarksPerPage,
    bookmarkPage * bookmarksPerPage + bookmarksPerPage
  );

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

      {/* ===== 북마크 섹션 ===== */}
      <div className="Bookmark-container">
        <div className="Bookmark-title">
          <span>북마크</span>
          <img src={BookmarkPlus} alt="플러스 버튼" className="Bookmark-plus" />
        </div>

        <div className="bookmark-grid">
          {paginatedBookmarks.map((bookmark) => (
            <div key={bookmark.bookmarkId} className="bookmark-item">
              <div className="bookmark-left">
                <div className="bookmark-category">
                  <img src={LinkImg} alt="링크 이미지" />
                  <span className="gradient-text">{bookmark.link}</span>
                </div>
                <span className="bookmark-name">{bookmark.name}</span>
              </div>
              <button className="bookmark-delete-btn">
                <img src={TrashCan} alt="삭제" className="trash-icon-img" />
              </button>
            </div>
          ))}
        </div>

        <div className="pagination-dots">
          {Array.from({ length: bookmarkPageCount }).map((_, idx) => (
            <span
              key={idx}
              className={`dot ${bookmarkPage === idx ? "active" : ""}`}
              onClick={() => handleBookmarkPageClick(idx)}
            />
          ))}
        </div>
      </div>

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

    </div>
  );
};

export default HomePage;
