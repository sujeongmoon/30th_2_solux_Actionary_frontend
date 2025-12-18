import { useEffect, useState } from 'react';
import BookmarkPlus from '../../assets/bookmark/BookmarkPlus.svg';
import TrashCan from '../../assets/bookmark/TrashCan.svg';
import LinkImg from '../../assets/bookmark/LinkImg.svg';
import './BookmarkSection.css';
import BookmarkModal from './BookmarkModal';

interface Bookmark {
  bookmarkId: number;
  name: string;
  link: string;
}

/* 더미 데이터 */
const mockBookmarks: Bookmark[] = [
  { bookmarkId: 101, name: '인프런', link: 'https://www.inflearn.com/ko/' },
  { bookmarkId: 102, name: '스노우보드 동아리', link: 'https://snowboard.sookmyung.ac.kr' },
  { bookmarkId: 103, name: 'React 공식 문서', link: 'https://react.dev/' },
  { bookmarkId: 104, name: 'Next.js 가이드', link: 'https://nextjs.org/' },
  { bookmarkId: 105, name: 'MDN Web Docs', link: 'https://developer.mozilla.org/ko/' },
  { bookmarkId: 106, name: '자바스크립트 정보', link: 'https://javascript.info/' },
  { bookmarkId: 107, name: 'CSS-Tricks', link: 'https://css-tricks.com/' },
  { bookmarkId: 108, name: '프로그래머스 코딩 테스트', link: 'https://programmers.co.kr/' },
  { bookmarkId: 109, name: '리덕스 툴킷 공식', link: 'https://redux-toolkit.js.org/' },
  { bookmarkId: 110, name: 'Vercel 블로그', link: 'https://vercel.com/blog' },
  { bookmarkId: 111, name: '토스 기술 블로그', link: 'https://tosstech.blog/' },
  { bookmarkId: 112, name: '네이버 D2', link: 'https://d2.naver.com/' },
  { bookmarkId: 113, name: '프론트엔드 개발자 인터뷰 질문', link: 'https://github.com/h5bp/Front-end-Developer-Interview-Questions' },
  { bookmarkId: 114, name: 'TypeScript 핸드북', link: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
  { bookmarkId: 115, name: 'Sentry 오류 추적', link: 'https://sentry.io/welcome/' },
];

const BookmarkSection = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(mockBookmarks); //서버 돌릴 땐 mockBookmarks 빼기
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookmarkPage, setBookmarkPage] = useState(0);
  const bookmarksPerPage = 9;
  const accessToken = localStorage.getItem('accessToken');

  // 북마크 조회
  /*
  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'GET',
        headers: {Authorization: `Bearer ${accessToken}`},
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data.success) {
        setBookmarks(data.data);
      } else {
        console.error('북마크 조회 실패: ', data.message);
      }
    } catch (err) {
      console.error('북마크 조회 중 오류 발생', err);
    }
  };

  useEffect(()=> {
    fetchBookmarks();
  }, []);
  */

  // 북마크 추가
  const handleAddBookmark = async (name: string, link: string) => {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ bookmarkName: name, bookmarkLink: link }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data.success) {
        setBookmarks(prev => [
          ...prev,
          { bookmarkId: data.data.bookmarkId, name: data.data.bookmarkName, link: data.data.link },
        ]);
        setIsModalOpen(false);
      } else {
        alert(data.message || '북마크 추가 실패');
      }
    } catch (err) {
      console.error(err);
      alert('북마크 추가 중 오류 발생');
    }
  };

  // 북마크 삭제
  const handleDeleteBookmark = async (bookmarkId: number) => {
    try {
      const res = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data.success) {
        setBookmarks(prev => prev.filter(b => b.bookmarkId !== bookmarkId));
      } else {
        alert(data.message || '삭제 실패');
      }
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류 발생');
    }
  };

  // 페이징 처리
  const bookmarkPageCount = Math.ceil(bookmarks.length / bookmarksPerPage);
  const paginatedBookmarks = bookmarks.slice(
    bookmarkPage * bookmarksPerPage,
    bookmarkPage * bookmarksPerPage + bookmarksPerPage
  );

  return (
    <>
      <div className="Bookmark-container">
        <div className="Bookmark-title">
          <span>북마크</span>
          <img
            src={BookmarkPlus}
            alt="플러스 버튼"
            className="Bookmark-plus"
            onClick={() => setIsModalOpen(true)}
          />
        </div>

        <div className="bookmark-grid">
          {paginatedBookmarks.map(bookmark => (
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

              <button className="bookmark-delete-btn" onClick={() => handleDeleteBookmark(bookmark.bookmarkId)}>
                <img src={TrashCan} alt="삭제" className="trash-icon-img" />
              </button>
            </div>
          ))}
        </div>

        <div className="pagination-dots">
          {Array.from({ length: bookmarkPageCount }).map((_, idx) => (
            <span
              key={idx}
              className={`dot ${bookmarkPage === idx ? 'active' : ''}`}
              onClick={() => setBookmarkPage(idx)}
            />
          ))}
        </div>
      </div>

      <BookmarkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(name, url) => handleAddBookmark(name, url)}
      />
    </>
  );
};

export default BookmarkSection;
