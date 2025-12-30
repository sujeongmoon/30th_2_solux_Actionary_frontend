import React from 'react';
import './Pagination.css';
import Arrow from '../../assets/Pagination/PaginationArrow.svg'

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const pageLimit = 5; 

  // 현재 그룹 계산
  const currentGroup = Math.floor((currentPage - 1) / pageLimit);
  const startPage = currentGroup * pageLimit + 1;
  const endPage = Math.min(startPage + pageLimit - 1, totalPages);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      {/* 1번 그룹(1~5페이지)이 아닐 때만 < 버튼을 보여줌 */}
      {startPage > 1 && (
        <button 
          className="page-next" 
          onClick={() => onPageChange(startPage - 1)}
        >
          &lt;
        </button>
      )}

      {pages.map((page) => (
        <button
          key={page}
          className={`page-num ${currentPage === page ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      
      {/* 마지막 그룹(끝 페이지 포함 그룹)이 아닐 때만 > 버튼을 보여줌 */}
      {endPage < totalPages && (
        <button 
          className="page-next" 
          onClick={() => onPageChange(endPage + 1)}
        >
          <img src={Arrow} alt="다음 페이지" className='paginationArrow'/>
        </button>
      )}
    </div>
  );
};

export default Pagination;