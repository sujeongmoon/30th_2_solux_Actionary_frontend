import { useState } from 'react';
import BookmarkPlus from '../../assets/BookmarkPlus.svg';
import TrashCan from '../../assets/TrashCan.svg';
import LinkImg from '../../assets/LinkImg.svg';
import './BookmarkSection.css';
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

const BookmarkSection = () => {
  const [bookmarkPage, setBookmarkPage] = useState(0);
  const bookmarksPerPage = 9;
  const bookmarkPageCount = Math.ceil(
    mockBookmarks.length / bookmarksPerPage
  );

  const paginatedBookmarks = mockBookmarks.slice(
    bookmarkPage * bookmarksPerPage,
    bookmarkPage * bookmarksPerPage + bookmarksPerPage
  );

  return (
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
                <a
                  href={bookmark.link}
                  className="gradient-text"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {bookmark.link}
                </a>
              </div>
              <span className="bookmark-name">{bookmark.name}</span>
            </div>

            <button className="bookmark-delete-btn">
              <img
                src={TrashCan}
                alt="삭제"
                className="trash-icon-img"
              />
            </button>
          </div>
        ))}
      </div>

      <div className="pagination-dots">
        {Array.from({ length: bookmarkPageCount }).map((_, idx) => (
          <span
            key={idx}
            className={`dot ${bookmarkPage === idx ? "active" : ""}`}
            onClick={() => setBookmarkPage(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default BookmarkSection;