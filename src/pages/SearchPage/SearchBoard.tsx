import React, { useEffect, useState } from 'react';
import '../BoardPage/BoardListPage.css';
import Pagination from '../../components/Pagination/Pagination';
import '../../pages/HomePage/HomePage.css';
import DropdownIcon from '../../assets/Board/Dropdown.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePosts, type Post } from '../../context/PostContext';

const SearchBoard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState<'popular' | 'latest'>('popular');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('말머리');
  const { posts } = usePosts();
  const [displayPosts, setDisplayPosts] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');


  // URL 쿼리에서 검색어 가져오기
  const query = new URLSearchParams(location.search);
  const keyword = query.get('keyword') || '';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  };

  useEffect(() => {
    let filteredPosts = posts;

    // 카테고리 필터
    if (selectedCategory !== '말머리' && selectedCategory !== '전체') {
      filteredPosts = filteredPosts.filter((p) => p.type === selectedCategory);
    }

    // 검색어 필터
    if (keyword) {
      filteredPosts = filteredPosts.filter(
        (p) =>
          p.title.includes(keyword) || 
          stripHtml(p.content?.text_content || '').includes(keyword)
    );
    }

    // 정렬
    if (selectedSort === 'popular') {
      filteredPosts = [...filteredPosts].sort(
        (a, b) => (b.comment_count || 0) - (a.comment_count || 0)
      );
    } else {
      filteredPosts = [...filteredPosts].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    setDisplayPosts(filteredPosts);
    setTotalPages(1); // MockData용, 실제 API라면 페이지 계산
  }, [posts, currentPage, selectedSort, selectedCategory, keyword]);

  const handleSortChange = (sortType: 'popular' | 'latest') => {
    setSelectedSort(sortType);
    setCurrentPage(1);
    setIsSortOpen(false);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryOpen(false);
    setCurrentPage(1);
  };

  return (
    <div className="board-container">
      <nav className="sub-navigation">
        <a href="/board" className="nav-link-home-link">게시판</a>
        <span className="nav-divider">|</span>
        <a href="/" className="nav-link">홈</a>
        <span className="nav-divider">|</span>
        <a href="/studies" className="nav-link">스터디</a>
      </nav>

      <div className="divider" />

      <div className="content-section">
        {/* 정렬 드롭다운 */}
        <div className="sort-section">
          <div className="custom-dropdown-container">
            <button
              className="dropdown-label"
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsCategoryOpen(false);
              }}
            >
              {selectedSort === 'popular' ? '인기순' : '최신순'}
              <span className={`arrow ${isSortOpen ? 'up' : 'down'}`}>
                <img src={DropdownIcon} alt="arrow" className="board-pagination-icon" />
              </span>
            </button>

            {isSortOpen && (
              <div className="custom-dropdown-menu">
                <div className="dropdown-item" onClick={() => handleSortChange('popular')}>
                  인기순
                </div>
                <div className="dropdown-divider" />
                <div className="dropdown-item" onClick={() => handleSortChange('latest')}>
                  최신순
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 게시판 테이블 */}
        <div className="table-card">
          <table className="board-table">
            <thead>
              <tr>
                <th className="header-dropdown-cell">
                  <div className="header-dropdown-wrapper">
                    <div
                      className="header-label"
                      onClick={() => {
                        setIsCategoryOpen(!isCategoryOpen);
                        setIsSortOpen(false);
                      }}
                    >
                      {selectedCategory}
                      <span className={`arrow ${isCategoryOpen ? 'up' : 'down'}`}>
                        <img src={DropdownIcon} alt="arrow" className="board-pagination-icon" />
                      </span>
                    </div>

                    {isCategoryOpen && (
                      <div className="header-dropdown-menu">
                        <div className="dropdown-item-board" onClick={() => handleCategoryChange('전체')}>
                          말머리
                        </div>
                        <div className="dropdown-divider" />
                        <div className="dropdown-item-board" onClick={() => handleCategoryChange('소통')}>
                          소통
                        </div>
                        <div className="dropdown-divider" />
                        <div className="dropdown-item-board" onClick={() => handleCategoryChange('인증')}>
                          인증
                        </div>
                        <div className="dropdown-divider" />
                        <div className="dropdown-item-board" onClick={() => handleCategoryChange('질문')}>
                          질문
                        </div>
                      </div>
                    )}
                  </div>
                </th>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>댓글수</th>
              </tr>
            </thead>

            <tbody>
              {displayPosts.map((item) => (
                <tr key={item.postId} onClick={() => navigate(`/board/${item.postId}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="badge">
                      <span>{item.type}</span>
                    </div>
                  </td>
                  <td>{item.title}</td>
                  <td className="author-cell">{item.nickname}</td>
                  <td className="date-cell">{formatDate(item.created_at)}</td>
                  <td className="comment-count">{item.comment_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 하단 섹션: 게시글 작성 버튼 제거 */}
        <div className="bottom-section">
          <div className="pagination-wrapper">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBoard;
