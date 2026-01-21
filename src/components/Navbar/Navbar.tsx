import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import Searchbar from "./Searchbar";
import LoginAlertModal from "../AlertModal/LoginAlertModal";
import Nlogo from '../../assets/Navbar/Nlogo.svg';
import ProfilePerson from "../../assets/Navbar/ProfilePerson.svg";
import { useAuth } from "../../context/AuthContext";
import { getMyInfo } from "../../api/sidebar";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  //const profileImageUrl = user?.profileImageUrl ?? null;
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

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
      navigate("/mypage");
    } else {
      setLoginModalOpen(true);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setProfileImageUrl(null);
      return;
    }

    const fetchUser = async () => {
      try {
        const userInfo = await getMyInfo();
        setProfileImageUrl(userInfo.profileImageUrl || null);
      } catch (e) {
        console.log("유저 정보 불러오기 실패", e);
      }
    };

    fetchUser();
  }, [isLoggedIn]);

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
          {/*<div
            className={`nav-profile-circle ${
              profileImageUrl ? "has-image" : ""
            }`}
            onClick={handleProfileClick}
          >*/}
          <div 
            className="nav-profile-circle"
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