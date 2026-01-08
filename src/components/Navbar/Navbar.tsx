import React from "react";
import { useNavigate} from "react-router-dom";
import './Navbar.css';
import Searchbar from "./Searchbar";

import Nlogo from '../../assets/navbar/Nlogo.svg';
import ProfilePerson from '../../assets/navbar/ProfilePerson.svg';

const Navbar = () => {
  const navigate = useNavigate();
  
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));
  const profileImageUrl: string | null = null;
  //const profileImageUrl = user?.profileImageUrl ?? null;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("profileImageUrl");
    navigate("/");
  }

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
            <button className="nav-btn" onClick={() => navigate("/login")}>로그인</button>
            <button className="nav-btn" onClick={() => navigate("/signup")}>회원가입</button>
          </>
        ) : (
          <button className="nav-btn" onClick={handleLogout}> 로그아웃</button>
        )}

        {/* 프로필 */}
        <div 
          className={`nav-profile-circle ${
            profileImageUrl ? "has-image" : ""
          }`}
          onClick={() => navigate("/mypage")}>
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="프로필" className="nav-profile-image"/>
            ):(
              <div className="profile-default">
                <img src={ProfilePerson} alt="프로필 아이콘" className="profile-person" />
              </div>
            )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
