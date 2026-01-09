import React, { useState } from "react";
import './Searchbar.css';
import { useNavigate } from "react-router-dom";

import SearchIcon from '../../assets/navbar/SearchIcon.svg';
import Dropdown from '../../assets/Navbar/dropdown.svg';

type Category = "전체" | "게시글" | "스터디";

const Searchbar = () => {
  const [category, setCategory] = useState<Category>("전체");
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!keyword.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }
    navigate(`/search?category=${category}&keyword=${encodeURIComponent(keyword)}`);
  };

  // 4. 엔터키 지원 함수
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };



  return (
    <div className="searchbar">
      {/* 카테고리 */}
      <div className="search-category">
        <button 
          className={`search-category-btn ${open ? "open" : ""}`}
          onClick={() => setOpen(!open)}> 
          <span>{category}</span>
          <img src={Dropdown} alt="화살표" className="dropdown-icon" />
        </button>

        {open && (
          <ul className="search-dropdown">
            {(["전체", "게시글", "스터디"] as Category[]).map((item) => (
              <li
                key={item}
                onClick={() => {
                  setCategory(item);
                  setOpen(false);
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 검색 입력 */}
      <input
        className="search-input"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
        type="text"
        placeholder="| 검색어를 입력하세요"
      />

      {/* 검색 아이콘 */}
      <button className="search-button" onClick={handleSearch}>
        <img src={SearchIcon} alt="검색" />
      </button>
    </div>
  );
};

export default Searchbar;
