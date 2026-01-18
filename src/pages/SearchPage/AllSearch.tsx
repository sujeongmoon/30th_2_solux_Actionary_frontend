import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchAll } from '../../api/Search/SearchAll';
import type { SearchStudyItemComponent } from '../../api/Search/SearchStudy';
import type { SearchPostItem } from '../../api/Search/SearchPost';
import StudySearchSection from '../../components/Search/StudySearchSection';
import PostSearchSection from '../../components/Search/PostSearchSection';
import '../../pages/HomePage/HomePage.css';


const AllSearch: React.FC = () => {
  const [params] = useSearchParams();
  const keyword = params.get('keyword') ?? '';

  const [studies, setStudies] = useState<SearchStudyItemComponent[]>([]);
  const [posts, setPosts] = useState<SearchPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!keyword) return;

    const fetchSearch = async () => {
      try {
        setIsLoading(true);
        const res = await searchAll(keyword);
        console.log('searchAll res:', res);

        const data = res.data?.data ?? { studies: [], posts: [] };
        setStudies(data.studies ?? []);
        setPosts(data.posts ?? []);
      } catch (e) {
        console.error('전체 검색 실패', e);
        setStudies([]);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearch();
  }, [keyword]);

  return (
    <>
    <nav className="sub-navigation">
      <a href="/posts" className="nav-link-home-link">스터디</a>
      <span className="nav-divider">|</span>
      <a href="/" className="nav-link">홈</a>
      <span className="nav-divider">|</span>
      <a href="/studies" className="nav-link">게시판</a>
    </nav>
    <div>
      <StudySearchSection studies={studies}/>
      {!isLoading && <PostSearchSection posts={posts} />}
    </div>
    </>
  );
};

export default AllSearch;
