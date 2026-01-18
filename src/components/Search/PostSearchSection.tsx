// src/components/PostSearchSection/PostSearchSection.tsx
import React, { useState } from 'react';
import './PostSearchSection.css';
import '../../pages/HomePage/HomePage.css';
import DropdownIcon from '../../assets/Board/Dropdown.svg';
import { useNavigate } from 'react-router-dom';
import { type SearchPostItem } from '../../api/Search/SearchPost';

interface Props {
  posts: SearchPostItem[];
}

const PostSearchSection: React.FC<Props> = ({ posts= [] }) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('말머리');

  const navigate = useNavigate();

  // 선택한 카테고리에 따라 필터링
  const filteredPosts = posts.filter(post => {
    return selectedCategory === '말머리' || selectedCategory === '전체'
    ? true
    : post.type === selectedCategory;
  }) ?? [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryOpen(false);
  };

  return (
    <div className="board-container">
      {/* 네비게이션 */}

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
                        <div className="pss-dropdown-divider" />
                        <div className="pss-dropdown-item-board" onClick={() => handleCategoryChange('구인')}>
                          구인
                        </div>
                        <div className="pss-dropdown-divider" />
                        <div className="pss-dropdown-item-board" onClick={() => handleCategoryChange('구인')}>
                          정보
                        </div>

인
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
              {filteredPosts.map(item => (
                <tr
                  key={item.postId}
                  onClick={() => navigate(`/posts/${item.postId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className="pss-badge">
                      <span>{item.type}</span>
                    </div>
                  </td>
                  <td>{item.title}</td>
                  <td className="pss-author-cell">{item.authorNickname}</td>
                  <td className="pss-date-cell">{formatDate(item.createdAt)}</td>
                  <td className="pss-comment-count">{item.commentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 하단 섹션: 더보기 버튼 */}
        <div className="pss-bottom-section">
          <button
            className="pss-btn-load-more"
            onClick={() => navigate('/posts')}
          >
            더보기 &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostSearchSection;
