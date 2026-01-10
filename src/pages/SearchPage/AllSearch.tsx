import React from 'react';
import PostSearchSection from '../../components/Search/PostSearchSection';
import StudySearchSection from "../../components/Search/StudySearchSection";

const AllSearch: React.FC = () => {
  return (
    <div>
      <PostSearchSection />
      <StudySearchSection />
    </div>
  );
};

export default AllSearch;
