import React, { useState} from "react";
import "./Login.css";

import SerchIcon from '../../assets/navbar/SearchIcon.svg';

type Category = "전체" | "게시글" | "스터디";

const Searchbar = () => {
  const [category, setCategory] = useState<Category>("전체");
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="searchbar">
      {/* 카테고리 선택 */}
      <div className="serch-category" onClick={() => setOpen(!open)}>
        <button onClick={() => setOpen(!open)}>
          {category} ▼
        </button>

        {open && (
          <ul className="search-dropdown">
            {["전체", "게시글", "스터디"].map((item) => (
              <li
                key={item}
                onClick={() => {
                  setCategory(item as Category);
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
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      type="text"
      />

      {/* 검색 아이콘 */}
      <button className={"search-button"}>
        <img src={SerchIcon} alt="검색" />
      </button>
    </div>
  );
};

export default Searchbar;
