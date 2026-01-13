import React, { useState } from "react";
import "./Login.css";

import Loginvector from "../../assets/login/LoginVector.svg";
import LoginLogo from "../../assets/login/LoginLogo.svg";
import { useLogin } from "../../hooks/useLogin";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login: React.FC = () => {
  const [loginId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<"id" | "password" | null>(null);

  const { login, isLoading, errorMessage } = useLogin();
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const handleLogin = async () => {
    if (!loginId || !password) return;

    // 2) 실제 로그인 (백엔드 붙었을 때)
    try {
      const data = await login({ loginId, password });
      console.log("로그인 성공:", data);

      const token = data.data.accessToken;

      if (!token) {
        console.log("토큰이 응답에 없습니다:", data);
        return;
      }

      setToken(token);
      navigate("/studies");
    } catch (err) {
      console.log("로그인 실패", err);
    }
  };

  return (
    <div className="login-page">
      <img src={Loginvector} alt="" className="login-background-vector" />
      <img src={LoginLogo} alt="로고" className="login-logo" />

      <div className="login-box">
        <div className="login-form">
          <label className="input-label-id">아이디</label>
          <div className={`input-field ${focusedInput === "id" ? "active" : ""}`}>
            <input
              type="text"
              placeholder="아이디를 입력해주세요"
              value={loginId}
              onFocus={() => setFocusedInput("id")}
              onBlur={() => setFocusedInput(null)}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <label className="input-label-pw">비밀번호</label>
          <div className={`input-field ${focusedInput === "password" ? "active" : ""}`}>
            <input
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-button" onClick={handleLogin} disabled={isLoading}>
            로그인
          </button>

          {isLoading && <p className="loading-message">로그인 진행 중입니다</p>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          
  

          <p className="signup-text" onClick={() => navigate("/signup")}>
            회원가입
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;