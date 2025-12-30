import React, { useState } from 'react';
import './BoardListPage.css';
import Pagination from '../../components/Pagination/Pagination';
import '../../pages/HomePage/HomePage.css';
import { type PopularPostItem } from '../../types/MainPagePostType';
import Dropdown from '../../assets/Board/Dropdown.svg'

const BoardListPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState<'popular' | 'latest'>('popular');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 열림 상태
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

  // --- 정렬 로직 ---
  const sortedData = [...allBoardData].sort((a, b) => {
    if (selectedSort === 'popular') {
      return b.comment_count - a.comment_count;
    } else {
      return b.postId - a.postId; // 최신순: postId 기준 내림차순
    }
  });

  // --- 페이지네이션 로직 ---
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // --- 핸들러 ---
  const handleSortChange = (sortType: 'popular' | 'latest') => {
    setSelectedSort(sortType);
    setIsDropdownOpen(false); // 선택 후 닫기
    setCurrentPage(1); // 정렬 변경 시 1페이지로 이동
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

      {/* 커스텀 정렬 드롭다운 */}
      <div className="sort-section">
        <div className="custom-dropdown-container">
          {/* 현재 선택된 값을 보여주는 버튼 */}
          <button 
            className="dropdown-label" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedSort === 'popular' ? '인기순' : '최신순'}
            <span className={`arrow ${isDropdownOpen ? 'up' : 'down'}`}><img src={Dropdown} alt="arrow" className='board-pagination' /></span>
          </button>

          {/* 이미지 디자인이 적용된 드롭다운 메뉴 */}
          {isDropdownOpen && (
            <div className="custom-dropdown-menu">
              <div 
                className={`dropdown-item ${selectedSort === 'popular' ? 'active' : ''}`}
                onClick={() => handleSortChange('popular')}
              >
                인기순
              </div>
              <div className="dropdown-divider"></div>
              <div 
                className={`dropdown-item ${selectedSort === 'latest' ? 'active' : ''}`}
                onClick={() => handleSortChange('latest')}
              >
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
              <th>말머리</th>
              <th className="text-left">제목</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>댓글수</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.postId}>
                <td><span className="badge">{item.type}</span></td>
                <td className="text-left">{item.title}</td>
                <td className="author-cell">{item.nickname}</td>
                <td>{item.created_at}</td>
                <td className="comment-count">{item.comment_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 하단 버튼 및 페이지네이션 */}
      <div className="bottom-section">
        <button className="btn-write">🖋 게시글 작성하기</button>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(pageNumber) => setCurrentPage(pageNumber)}
        />
      </div>
    </div>
  );
};

export default BoardListPage;