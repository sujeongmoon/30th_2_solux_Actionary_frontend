import React, { useEffect, useState } from 'react';
import './PostSearchSection.css';
import '../../pages/HomePage/HomePage.css';
import DropdownIcon from '../../assets/Board/Dropdown.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePosts, type Post } from '../../context/PostContext';

const PostSearchSection: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('말머리');
  const { posts } = usePosts();
  const [displayPosts, setDisplayPosts] = useState<Post[]>([]);

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

    setDisplayPosts(filteredPosts); // MockData용
  }, [posts, currentPage, selectedCategory, keyword]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryOpen(false);
    setCurrentPage(1);
  };

  return (
    <div className="board-container">
      <nav className="sub-navigation">
        <a href="/board" className="nav-link-home-link">스터디</a>
        <span className="nav-divider">|</span>
        <a href="/" className="nav-link">홈</a>
        <span className="nav-divider">|</span>
        <a href="/studies" className="nav-link">게시판</a>
      </nav>

      <div className="divider" />

      <div className="pss-content-section">
        {/* 게시판 헤더 */}
        <div className="pss-board-result-header">
          <span className="pss-board-result-head">게시판</span>
        </div>

        {/* 게시판 테이블 */}
        <div className="pss-table-card">
          <table className="pss-board-table">
            <thead>
              <tr>
                <th className="pss-header-dropdown-cell">
                  <div className="pss-header-dropdown-wrapper">
                    <div
                      className="pss-header-label"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    >
                      {selectedCategory}
                      <span className={`pss-arrow ${isCategoryOpen ? 'up' : 'down'}`}>
                        <img src={DropdownIcon} alt="arrow" className="pss-board-pagination-icon" />
                      </span>
                    </div>

                    {isCategoryOpen && (
                      <div className="pss-header-dropdown-menu">
                        <div className="pss-dropdown-item-board" onClick={() => handleCategoryChange('전체')}>
                          말머리
                        </div>
                        <div className="pss-dropdown-divider" />
                        <div className="pss-dropdown-item-board" onClick={() => handleCategoryChange('소통')}>
                          소통
                        </div>
                        <div className="pss-dropdown-divider" />
                        <div className="pss-dropdown-item-board" onClick={() => handleCategoryChange('인증')}>
                          인증
                        </div>
                        <div className="pss-dropdown-divider" />
                        <div className="pss-dropdown-item-board" onClick={() => handleCategoryChange('질문')}>
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
                    <div className="pss-badge">
                      <span>{item.type}</span>
                    </div>
                  </td>
                  <td>{item.title}</td>
                  <td className="pss-author-cell">{item.nickname}</td>
                  <td className="pss-date-cell">{formatDate(item.created_at)}</td>
                  <td className="pss-comment-count">{item.comment_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 하단 섹션: 더보기 버튼 */}
        <div className="pss-bottom-section">
        <button
            className="pss-btn-load-more"
            onClick={() => {
            // TODO: 여기에 더보기 로직 구현
            navigate('/board');
            }}
        >
            더보기 &gt;
        </button>
        </div>

      </div>
    </div>
  );
};

export default PostSearchSection;
