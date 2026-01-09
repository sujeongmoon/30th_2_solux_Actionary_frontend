import React from 'react';
import PostSearchSection from '../../components/Search/PostSearchSection';

const AllSearch: React.FC = () => {
  return (
    <div>
      {/* SearchBoard를 그대로 렌더링, 내부 드롭다운은 유지 */}
      <PostSearchSection />
    </div>
  );
};

export default AllSearch;
