import React, { useEffect, useState } from 'react';
import './BoardListPage.css';
import Pagination from '../../components/Pagination/Pagination';
import '../../pages/HomePage/HomePage.css';
import DropdownIcon from '../../assets/Board/Dropdown.svg';
import MagePen from '../../assets/Board/mage_pen.svg';
import { getPopularPosts, getLatestPosts } from '../../api/boardPost';
import { useNavigate } from 'react-router-dom';
import { type Post } from '../../api/boardPost';
import LoginAlertModal from '../../components/AlertModal/LoginAlertModal';


const BoardListPage: React.FC = () => {
  /** ======================
   * 상태
   ====================== */
  const [currentPage, setCurrentPage] = useState(1); // UI 기준 1부터
  const [selectedSort, setSelectedSort] = useState<'popular' | 'latest'>('popular');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('말머리');
  const [displayPosts, setDisplayPosts] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('accessToken'));
  const navigate = useNavigate();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  };

  const handleWriteClick = () => {
  if (!isLoggedIn) {
    setIsLoginModalOpen(true);
    return;
  }

  navigate('write');
};




  /** ======================
   * API 연동
   ====================== */
  useEffect(() => {
    console.log('useEffect 실행'); 
    const fetchPosts = async () => {
      try {
    
        const apiPage = currentPage - 1; // 백엔드 0부터 시작

        const params: { page: number; type?: string } = { page: apiPage };
        if (selectedCategory !== '말머리' && selectedCategory !== '전체') {
          params.type = selectedCategory;
        }

        const data =
          selectedSort === 'popular'
            ? await getPopularPosts(params)
            : await getLatestPosts(params);

        console.log('API 응답:', data);
        setDisplayPosts(data?.posts ?? []);
        setTotalPages(data.pageInfo.totalPages);
      } catch (error) {
        console.error('게시글 조회 실패', error);
      }
    };

    fetchPosts();
  }, [currentPage, selectedSort, selectedCategory]);

  /** ======================
   * 핸들러
   ====================== */
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

  /** ======================
   * 렌더링
   ====================== */
  return (
    <>
    <nav className="sub-navigation">
        <a href="/posts" className="nav-link-home-link">게시판</a>
        <span className="nav-divider">|</span>
        <a href="/" className="nav-link">홈</a>
        <span className="nav-divider">|</span>
        <a href="/studies" className="nav-link">스터디</a>
      </nav>
      <div className="sub-nav-divider" />
    <div className="board-container">

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
                        <div className="dropdown-divider" />
                        <div className="dropdown-item-board" onClick={() => handleCategoryChange('질문')}>
                          구인
                        </div>
                        <div className="dropdown-divider" />
                        <div className="dropdown-item-board" onClick={() => handleCategoryChange('질문')}>
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
                  <td className="author-cell">{item.nickname}</td>
                  <td className="date-cell">{formatDate(item.createdAt)}</td>
                  <td className="comment-count">{item.commentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 하단 섹션 */}
        <div className="bottom-section">
          <button className="btn-write"
            onClick={handleWriteClick}>
            <img src={MagePen} alt="게시글 작성하기" className="mage-pen" />
            게시글 작성하기
          </button>

          <div className="pagination-wrapper">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
          <LoginAlertModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLogin={() => navigate('/login')}
          />

        </div>
      </div>
    </div>
    </>
  );
};

export default BoardListPage;
