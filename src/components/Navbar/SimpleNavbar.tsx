import { useNavigate} from "react-router-dom";
import './Navbar.css';
import Nlogo from '../../assets/navbar/Nlogo.svg';

const SimpleNavbar = () => {
  const navigate = useNavigate();
  
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  }

  return (
    <nav className="simple-navbar">
      {/* 로고 */}
      <img src={Nlogo} alt="로고" className="navbar-logo" onClick={() => navigate("/")} />

      {/* 버튼 영역 */}
      <div className="navbar-actions-simple">
        {!isLoggedIn ? (
          <>
            <button className="nav-btn" onClick={() => navigate("/login")}>로그인</button>
            <button className="nav-btn" onClick={() => navigate("/signup")}>회원가입</button>
          </>
        ) : (
          <button className="nav-btn" onClick={handleLogout}> 로그아웃</button>
        )}

      </div>
    </nav>
  );
};

export default SimpleNavbar;