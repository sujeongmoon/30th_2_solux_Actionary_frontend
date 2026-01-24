import React, { useEffect, useState } from 'react';
import './SearchBoard.css';
import Pagination from '../../components/Pagination/Pagination';
import '../../pages/HomePage/HomePage.css';
import DropdownIcon from '../../assets/Board/Dropdown.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchPosts, type SearchPostItem } from '../../api/Search/SearchPost'; 

const SearchBoard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState<'popular' | 'latest'>('popular');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('말머리');
  const [displayPosts, setDisplayPosts] = useState<SearchPostItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();


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

  // 실제 API 연동용
  // ==========================
  
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await searchPosts(
          keyword,
          currentPage,
          10,
          selectedSort === 'latest' ? 'LATEST' : 'POPULAR',
          selectedCategory === '전체' || selectedCategory === '말머리' ? undefined : selectedCategory
        );

        setDisplayPosts(
          res.content.map((item) => ({
            postId: item.postId,
            type: item.type,
            title: item.title,
            authorNickname: item.authorNickname,
            createdAt: item.createdAt,
            commentCount: item.commentCount,
            isMine: item.isMine ?? false,
          }))
        );
        setTotalPages(res.pageInfo.totalPages);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message || '검색 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [keyword, currentPage, selectedSort, selectedCategory]);


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
        <a href="/posts" className="nav-link-home-link">게시판</a>
        <span className="nav-divider">|</span>
        <a href="/" className="nav-link">홈</a>
        <span className="nav-divider">|</span>
        <a href="/studies" className="nav-link">스터디</a>
      </nav>

      <div className="divider" />

      <div className="content-section">
        {/* 정렬 드롭다운 */}
        <div className="sort-section">
        <div className='board-result-header'>
          <span className='board-result-head'>제목+내용 검색 결과</span>
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
        </div>

        {/* 게시판 테이블 */}
        <div className="table-card">
          {loading && <div className='search-board-loading'>게시글 불러오는 중 ... </div>}
          {error && <div className='search-board-error'>{error}</div>}

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
                        <div className="dropdown-divider" />
                        <div className="dropdown-item-board" onClick={() => handleCategoryChange('구인')}>
                          구인
                        </div>
                        <div className="dropdown-divider" />
                        <div className="dropdown-item-board" onClick={() => handleCategoryChange('정보')}>
                          정보
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
                <tr key={item.postId} onClick={() => navigate(`/posts/${item.postId}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="badge">
                      <span>{item.type}</span>
                    </div>
                  </td>
                  <td>{item.title}</td>
                  <td className="author-cell">{item.authorNickname}</td>
                  <td className="date-cell">{formatDate(item.createdAt)}</td>
                  <td className="comment-count">{item.commentCount}</td>
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
