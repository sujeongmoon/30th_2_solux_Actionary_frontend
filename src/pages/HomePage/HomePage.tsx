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
import { mockBoardList } from '../../types/MainPagePostType';

/* 더미 데이터 */
const mockBookmarks = [
  {
    bookmarkId: 101, // 고유 ID
    name: '인프런',
    link: 'https://www.inflearn.com/ko/',
  },
  {
    bookmarkId: 102, // 고유 ID
    name: '스노우보드 동아리',
    link: 'https://snowboard.sookmyung.ac.kr',
  },
  {
    bookmarkId: 103, // 고유 ID
    name: 'React 공식 문서',
    link: 'https://react.dev/',
  },
  {
    bookmarkId: 104,
    name: 'Next.js 가이드',
    link: 'https://nextjs.org/',
  },
  {
    bookmarkId: 105,
    name: 'MDN Web Docs',
    link: 'https://developer.mozilla.org/ko/',
  },
  {
    bookmarkId: 106,
    name: '자바스크립트 정보',
    link: 'https://javascript.info/',
  },
  {
    bookmarkId: 107,
    name: 'CSS-Tricks',
    link: 'https://css-tricks.com/',
  },
  {
    bookmarkId: 108,
    name: '프로그래머스 코딩 테스트',
    link: 'https://programmers.co.kr/',
  },
  {
    bookmarkId: 109,
    name: '리덕스 툴킷 공식',
    link: 'https://redux-toolkit.js.org/',
  },
  {
    bookmarkId: 110,
    name: 'Vercel 블로그',
    link: 'https://vercel.com/blog',
  },
  {
    bookmarkId: 111,
    name: '토스 기술 블로그',
    link: 'https://tosstech.blog/',
  },
  {
    bookmarkId: 112,
    name: '네이버 D2',
    link: 'https://d2.naver.com/',
  },
  {
    bookmarkId: 113,
    name: '프론트엔드 개발자 인터뷰 질문',
    link: 'https://github.com/h5bp/Front-end-Developer-Interview-Questions',
  },
  {
    bookmarkId: 114,
    name: 'TypeScript 핸드북',
    link: 'https://www.typescriptlang.org/docs/handbook/intro.html',
  },
  {
    bookmarkId: 115,
    name: 'Sentry 오류 추적',
    link: 'https://sentry.io/welcome/',
  },
];

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
                  <a href={bookmark.link} className="gradient-text" target="_blank" rel="noopener noreferrer">
                    {bookmark.link}
                  </a>
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

      {/*인기 게시글 섹션 */}
      <div className="popular-board-container">
        <div className="popular-board-header">
          <h2 className="popular-board-title">인기 게시글</h2>
          <button className="popular-board-more">더 보기</button>

          <div className="popular-board-grid">
            {boardList.map(item => (
              <div key={item.postId} className="board-item">
                <span className = {`board-tag ${
                  item.type === '소통' ? 'tag-communication' : 
                  item.type === '멘토' ? 'tag-study' : 'tag-question'
                  }`}>{item.type}</span>
                <p className="board-content">{item.title}</p>
                <span className="board-likes">💬</span>
              </div>
            ))}
      
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;
