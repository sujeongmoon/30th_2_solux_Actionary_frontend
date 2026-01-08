import React, { useState } from "react";
import './Searchbar.css';

import SearchIcon from '../../assets/navbar/SearchIcon.svg';
import Dropdown from '../../assets/Navbar/dropdown.svg';

type Category = "전체" | "게시물" | "스터디";

const Searchbar = () => {
  const [category, setCategory] = useState<Category>("전체");
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);

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
        type="text"
        placeholder="| 검색어를 입력하세요"
      />

      {/* 검색 아이콘 */}
      <button className={"search-button"}>
        <img src={SearchIcon} alt="검색" />
      </button>
    </div>
  );
};

export default Searchbar;
