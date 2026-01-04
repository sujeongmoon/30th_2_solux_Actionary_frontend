import React from "react";
import { useNavigate} from "react-router-dom";
import './Navbar.css';
import Searchbar from "./Searchbar";
import Nlogo from '../../assets/navbar/Nlogo.svg';
import ProfileCircle from '../../assets/navbar/ProfileCircle.svg';
import ProfilePerson from '../../assets/navbar/ProfilePerson.svg';

const Navbar = () => {
  const navigate = useNavigate();
  
  //나중에 auth 상태로 교체
  const isLoggedIn = false; 

  return (
    <nav className="navbar">
      {/* 로고 */}
      <img src={Nlogo} alt="로고" className="navbar-logo" onClick={() => navigate("/")} />

      {/* 검색바 */}
      <Searchbar />

      {/* 버튼 영역 */}
      <div className="navbar-actions">
        {!isLoggedIn ? (
          <>
            <button onClick={() => navigate("/login")}>로그인</button>
            <button onClick={() => navigate("/signup")}>회원가입</button>
          </>
        ) : (
          <button> 로그아웃</button>
        )}

        {/* 프로필 */}
        <div className="navbar-profile" onClick={() => navigate("/mypage")}>
          <img src={ProfilePerson} alt="프로필 아이콘" className="profile-person" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
