import React, { useState } from 'react';
import './BoardListPage.css';
import Pagination from '../../components/Pagination/Pagination';
import '../../pages/HomePage/HomePage.css';
import { type PopularPostItem } from '../../types/MainPagePostType';
import DropdownIcon from '../../assets/Board/Dropdown.svg'
import MagePen from '../../assets/Board/mage_pen.svg'

const BoardListPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState<'popular' | 'latest'>('popular');
  const [isSortOpen, setIsSortOpen] = useState(false); // 정렬 드롭다운
  const [isCategoryOpen, setIsCategoryOpen] = useState(false); // 말머리 드롭다운
  const [selectedCategory, setSelectedCategory] = useState('말머리'); // 선택된 말머리 (기본값)

  const itemsPerPage = 5;

  // --- mockData ---
  const allBoardData: PopularPostItem[] = Array.from({ length: 33 }, (_, i) => ({
    postId: i + 1,
    type: i % 3 === 0 ? '소통' : i % 3 === 1 ? '인증' : '질문',
    title: `게시글 제목 ${i + 1}`,
    nickname: `사용자${i + 1}`,
    created_at: `2023-10-${(i % 30) + 1}`,
    comment_count: Math.floor(Math.random() * 100),
  }));

  // --- 1. 말머리 필터링 로직 ---
  const filteredData = allBoardData.filter((item) => {
    if (selectedCategory === '말머리' || selectedCategory === '전체') return true;
    return item.type === selectedCategory;
  });

  // --- 2. 정렬 로직 ---
  const sortedData = [...filteredData].sort((a, b) => {
    if (selectedSort === 'popular') {
      return b.comment_count - a.comment_count;
    } else {
      return b.postId - a.postId; 
    }
  });

  // --- 3. 페이지네이션 로직 ---
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // --- 핸들러 ---
  const handleSortChange = (sortType: 'popular' | 'latest') => {
    setSelectedSort(sortType);
    setIsSortOpen(false);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryOpen(false);
    setCurrentPage(1); // 카테고리 변경 시 1페이지로
  };

  return (
    <div className="board-container">
      {/* 서브 네비게이션 */}
      <nav className="sub-navigation">
        <a href="/" className="nav-link-home-link">홈</a>
        <span className="nav-divider">|</span>
        <a href="/study" className="nav-link">스터디</a>
        <span className="nav-divider">|</span>
        <a href="/board" className="nav-link">게시판</a>
      </nav>

      <div className="divider"></div>

      {/* 우측 상단 정렬 드롭다운 */}
      <div className='content-section'>
      <div className="sort-section">
        <div className="custom-dropdown-container">
          <button className="dropdown-label" onClick={() => {setIsSortOpen(!isSortOpen); setIsCategoryOpen(false);}}>
            {selectedSort === 'popular' ? '인기순' : '최신순'}
            <span className={`arrow ${isSortOpen ? 'up' : 'down'}`}>
              <img src={DropdownIcon} alt="arrow" className='board-pagination-icon' />
            </span>
          </button>
          {isSortOpen && (
            <div className="custom-dropdown-menu">
              <div className="dropdown-item" onClick={() => handleSortChange('popular')}>인기순</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item" onClick={() => handleSortChange('latest')}>최신순</div>
            </div>
          )}
        </div>
      </div>
      {/* 게시판 테이블 */}
      <div className="table-card">
        <table className="board-table">
          <thead>
            <tr>
              {/* 말머리 헤더 드롭다운 적용 */}
              <th className="header-dropdown-cell">
                <div className="header-dropdown-wrapper">
                  <div className="header-label" onClick={() => {setIsCategoryOpen(!isCategoryOpen); setIsSortOpen(false);}}>
                    {selectedCategory}
                    <span className={`arrow ${isCategoryOpen ? 'up' : 'down'}`}>
                      <img src={DropdownIcon} alt="arrow" className='board-pagination-icon' />
                    </span>
                  </div>
                  {isCategoryOpen && (
                    <div className="header-dropdown-menu">
                      <div className="dropdown-item" onClick={() => handleCategoryChange('전체')}>말머리</div>
                      <div className="dropdown-divider"></div>
                      <div className="dropdown-item" onClick={() => handleCategoryChange('소통')}>소통</div>
                      <div className="dropdown-divider"></div>
                      <div className="dropdown-item" onClick={() => handleCategoryChange('인증')}>인증</div>
                      <div className="dropdown-divider"></div>
                      <div className="dropdown-item" onClick={() => handleCategoryChange('질문')}>질문</div>
                    </div>
                  )}
                </div>
              </th>
              <th >제목</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>댓글수</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.postId}>
                <td><div className="badge"><span>{item.type}</span></div></td>
                <td>{item.title}</td>
                <td className="author-cell">{item.nickname}</td>
                <td className="date-cell">{item.created_at}</td>
                <td className="comment-count">{item.comment_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bottom-section">
        <button className="btn-write"><img src={MagePen} alt="게시글 작성하기" className='mage-pen'/>게시글 작성하기</button>
        <div className="pagination-wrapper">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(pageNumber) => setCurrentPage(pageNumber)}
        />
        </div>
      </div>
      </div>
    </div>
  );
};

export default BoardListPage;