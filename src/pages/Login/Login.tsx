import React, { useState } from "react";
import "./Login.css";

import Loginvector from '../../assets/login/LoginVector.svg';
import LoginLogo from '../../assets/login/LoginLogo.svg';
import { useLogin } from "../../hooks/useLogin";

const Login: React.FC = () => {
  const [loginId, setuserId] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<"id" | "password" | null>(null);
  
  const { login, isLoading, errorMessage} = useLogin();

  const handleLogin = async () => {
    if (!loginId || !password) return;

    try {
      const data = await login({ loginId, password });
      console.log("로그인 성공:", data);
    } catch (err) {
      console.log("로그인 실패", err);
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
          <button className="login-button" onClick={handleLogin} disabled={isLoading}> 
            로그인 </button>

          {/* 로그인 진행 메시지*/}
          {isLoading && <p className="loading-message"> 로그인 진행 중입니다 </p>}

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
