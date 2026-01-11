import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchAll } from '../../api/Search/SearchAll';
import type { SearchStudyItemComponent } from '../../api/Search/SearchStudy';
import type { SearchPostItem } from '../../api/Search/SearchPost';
import StudySearchSection from '../../components/Search/StudySearchSection';
import PostSearchSection from '../../components/Search/PostSearchSection';


const AllSearch: React.FC = () => {
  const [params] = useSearchParams();
  const keyword = params.get('keyword') ?? '';

  //const [studies, setStudies] = useState<SearchStudyItemComponent[]>([]);
  const [posts, setPosts] = useState<SearchPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!keyword) return;

    const fetchSearch = async () => {
      try {
        setIsLoading(true);
        const res = await searchAll(keyword);
        const data = res.data.data ?? res.data;
        setStudies(res.data ?? []);
        setPosts(data.posts ?? []);
      } catch (e) {
        console.error('전체 검색 실패', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearch();
  }, [keyword]);

  return (
    <div>
      <StudySearchSection />
      {!isLoading && <PostSearchSection posts={posts} />}
    </div>
  );
};

export default AllSearch;
