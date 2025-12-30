import React, { useState } from 'react';
import './BoardListPage.css';
import Pagination from '../../components/Pagination/Pagination';

const BoardListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 한 페이지에 보여줄 게시글 수

  // 1. 샘플 데이터 (데이터가 늘어날 상황을 대비해 length를 조절해 보세요)
  const allBoardData = Array.from({ length: 33 }, (_, i) => ({ // 예: 33개 데이터
    id: i + 1,
    type: i % 3 === 0 ? '소통' : i % 3 === 1 ? '인증' : '질문',
    title: `게시글 제목 ${i + 1}`,
    author: `사용자${i + 1}`,
    date: '25/9/3',
    comments: Math.floor(Math.random() * 100)
  }));

  // 2. ★ 전체 페이지 수 동적 계산
  // Math.ceil을 써야 33/5 = 6.6일 때 7페이지까지 생성됩니다.
  const totalPages = Math.ceil(allBoardData.length / itemsPerPage);

  // 3. 현재 페이지에 보여줄 데이터 슬라이싱
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allBoardData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="board-container">
      {/* ... 상단 네비게이션 및 정렬 생략 ... */}

      <div className="table-card">
        <table className="board-table">
          <thead>
            <tr>
              <th>말머리 ⌵</th>
              <th className="text-left">제목</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>댓글수</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id}>
                <td><span className="badge">{item.type}</span></td>
                <td className="text-left">{item.title}</td>
                <td className="author-cell">{item.author}</td>
                <td>{item.date}</td>
                <td className="comment-count">{item.comments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bottom-section">
        <button className="btn-write">🖋 게시글 작성하기</button>
        
        {/* 4. ★ totalPages를 변수로 전달 */}
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} // 이제 5가 아니라 계산된 값이 들어갑니다.
          onPageChange={(pageNumber) => setCurrentPage(pageNumber)} 
        />
      </div>
    </div>
  );
};

export default BoardListPage;