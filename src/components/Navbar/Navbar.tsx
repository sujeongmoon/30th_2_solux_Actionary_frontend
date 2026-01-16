import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import Searchbar from "./Searchbar";
import LoginAlertModal from "../AlertModal/LoginAlertModal";
import Nlogo from '../../assets/Navbar/Nlogo.svg';
import ProfilePerson from "../../assets/Navbar/ProfilePerson.svg";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();

  //(삭제?)const isLoggedIn = Boolean(localStorage.getItem("accessToken"));
 const { isLoggedIn, logout } = useAuth();
  const profileImageUrl: string | null = null;

  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleLogout = () => {
    /* localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("profileImageUrl");*/
    logout();
    navigate("/");
  };

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate("/OwnerPage");
    } else {
      setLoginModalOpen(true);
    }
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        <div className="navbar-left">
          {/* 로고 */}
          <img
            src={Nlogo}
            alt="로고"
            className="navbar-logo"
            onClick={() => navigate("/")}
          />

          {/* 검색바 */}
          <Searchbar />
        </div>

        {/* 버튼 영역 */}
        <div className="navbar-actions">
          {!isLoggedIn ? (
            <>
              <button className="nav-btn" onClick={() => navigate("/login")}>
                로그인
              </button>
              <button className="nav-btn" onClick={() => navigate("/signup")}>
                회원가입
              </button>
            </>
          ) : (
            <button className="nav-btn" onClick={handleLogout}>
              로그아웃
            </button>
          )}

          {/* 프로필 */}
          <div
            className={`nav-profile-circle ${
              profileImageUrl ? "has-image" : ""
            }`}
            onClick={handleProfileClick}
          >
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="프로필"
                className="nav-profile-image"
              />
            ) : (
              <div className="profile-default">
                <img
                  src={ProfilePerson}
                  alt="프로필 아이콘"
                  className="profile-person"
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ================= 로그인 안내 모달 ================= */}
      {loginModalOpen && (
        <LoginAlertModal 
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLogin={() => {
            setLoginModalOpen(false);
            navigate("/login");
          }} />
      )}
    </>
  );
};

export default Navbar;

