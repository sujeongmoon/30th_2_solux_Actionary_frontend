import React from "react";
import "./SignupComplete.css";
import { useNavigate } from "react-router-dom";

import SignupCPvector from "../../assets/Signup/SignupCPvector.svg";
import LoginLogo from "../../assets/login/LoginLogo.svg";

const SignupComplete: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="signup-complete-page">
      {/* 배경 그래픽 */}
      <img src={SignupCPvector} alt="" className="signup-complete-background"/>

      {/* 완료 박스*/}
      <div className="signup-complete-box">
        <img src={LoginLogo} alt="로고" className="signup-complete-logo" />

        {/* 완료 문구 */}
        <p className="signup-complete-text">회원가입이<br />완료되었습니다!</p>

        {/* 이동 버튼 */}
        <button className="go-main-button" onClick={() => navigate("/")}>메인으로</button>
      </div>    
    </div>
  );
};

export default SignupComplete;