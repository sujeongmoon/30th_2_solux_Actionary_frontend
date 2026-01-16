import { useEffect, useState } from 'react';
import BookmarkPlus from '../../assets/bookmark/BookmarkPlus.svg';
import TrashCan from '../../assets/bookmark/TrashCan.svg';
import LinkImg from '../../assets/bookmark/LinkImg.svg';
import './BookmarkSection.css';
import BookmarkModal from './BookmarkModal';
import api from '../../api/client';

interface Bookmark {
  bookmarkId: number;
  name: string;
  link: string;
}

const BookmarkSection = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]); //서버 돌릴 땐 mockBookmarks 빼기
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookmarkPage, setBookmarkPage] = useState(0);
  const bookmarksPerPage = 9;


  // 북마크 조회

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/bookmarks');
      if (res.data.success) {
        setBookmarks(Array.isArray(res.data.data.bookmarks) ? res.data.data.bookmarks : []);
      } else {
        console.error('북마크 조회 실패:', res.data.message);
        setBookmarks([]);
      }
    } catch (err) {
      console.error('북마크 조회 중 오류 발생', err);
      setBookmarks([]);
    } 
  };

  useEffect(()=> {
    fetchBookmarks();
  }, []);

  // 북마크 추가
  const handleAddBookmark = async (name: string, link: string) => {
    try {
      const res = await api.post('/bookmarks', { bookmarkName: name, link: link});
      if (res.data.success) {
        setBookmarks((prev) => [
          ...prev,
          { bookmarkId: res.data.data.bookmarkId, name: res.data.data.bookmarkName, link: res.data.data.link}
        ]);
        setIsModalOpen(false)
      } else {
        alert(res.data.message || '북마크 추가 실패');
      } 
    } catch (err) {
      console.error('북마크 추가 중 오류 발생', err);
      alert('북마크 추가 중 오류 발생');
    }
  };

    // 북마크 삭제
  const handleDeleteBookmark = async (bookmarkId: number) => {
    try {
      const res = await api.delete(`/bookmarks/${bookmarkId}`);
      if (res.data.success) {
        setBookmarks((prev) => prev.filter((b) => b.bookmarkId !== bookmarkId));
      } else {
        alert(res.data.message || '삭제 실패');
      }
    } catch (err) {
      console.error('삭제 중 오류 발생', err);
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
