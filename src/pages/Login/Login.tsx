import React, { useState } from "react";
import "./Login.css";

import Loginvector from '../../assets/login/LoginVector.svg';
import LoginLogo from '../../assets/login/LoginLogo.svg';

/* 더미 데이터 */
const DUMMY_ACCOUNT = {
  id: "user1234",
  password: "password123",
};

const Login: React.FC = () => {
  const [loginId, setuserId] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<"id" | "password" | null>(null);
  
  /* 에러 메시지 상태 */
  const [errorMessage, setErrorMessage] = useState("");

  /* 로그인 더미 테스트 로직 */
  const handleLogin = () => {
    if (!loginId || !password) {
      setErrorMessage("아이디와 비밀번호를  입력해주세요.");
      return;
    }

    if (loginId === DUMMY_ACCOUNT.id && password === DUMMY_ACCOUNT.password) {
      setErrorMessage("");
      alert("로그인 성공!");
    } else {
      setErrorMessage("아이디 또는 비밀번호가 틀렸습니다.");
    }

    
  };

  return (
    <div className="login-page">

      {/* 배경 */}
      <img src={Loginvector} alt="" className="login-background-vector" />
      
      {/* 로고 */}
      <img src={LoginLogo} alt="로고" className="login-logo" />

      {/* 로그인 박스 */}
      <div className="login-box">
        <div className="login-form">

          {/* 아이디 입력 */}
          <label className="input-label-id">아이디</label>
          <div 
            className={`input-field ${focusedInput === "id" ? "active" : ""}`}>
            <input
              type="text"
              placeholder="아이디를 입력해주세요"
              value={loginId}
              onFocus={() => setFocusedInput("id")}
              onBlur={() => setFocusedInput(null)}
              onChange={(e) => setuserId(e.target.value)}
            />
          </div>

          {/* 비밀번호 입력 */}
          <label className="input-label-pw">비밀번호</label>
          <div 
            className={`input-field ${focusedInput === "password" ? "active" : ""}`}>
            <input
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* 로그인 버튼 */}
          <button className="login-button" onClick={handleLogin}> 로그인 </button>

          {/* 에러 메시지 */}
          {errorMessage && (<p className="error-message">{errorMessage}</p>)}

          {/* 회원가입 텍스트 버튼*/}
          <p className="signup-text">회원가입</p>
        </div>
      </div>
    </div>
  );
};


export default Login;
