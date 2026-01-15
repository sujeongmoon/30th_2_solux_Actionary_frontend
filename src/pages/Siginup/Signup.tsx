import React, { useState } from "react";
import "./Signup.css";

import Signupvector from '../../assets/Signup/Signupvector.svg';
import Profile from '../../assets/MyPage/Profile.svg';

import { useSignup } from "../../hooks/useSignup";
import { useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const { signupUser, isLoading, errorMessage} = useSignup();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  /* 프로필 이미지 */
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  /* 폼 데이터 */
  const [form, setForm] = useState({
    loginId: "newUser123",
    password: "password123",
    phoneNumber: "010-1234-5678",
    email: "user@example.com",
    name: "홍길동",
    birthday: "2025-10-31",
  });

  /* 입력값 변경 */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value}));
  };

    /* 프로필 이미지 업로드 */
  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (profilePreview) URL.revokeObjectURL(profilePreview);
    
    
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  }; 

  /* 아이디, 비밀번호 유효성 체크 */
  const [clientError, setClientError] = useState<string | null>(null);
  const validateForm = () => {
    if (form.loginId.length < 6) {
      setClientError("아이디는 6자 이상이어야 합니다.");
      return false;
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}/.test(form.password))  {
      setClientError("비밀번호는 6자 이상, 영어와 숫자를 포함해야합니다.");
      return false;
    }
    setClientError(null);
    return true;
  }
  
  /* 회원가입 */
  const handleSignup = async () => {
    console.log("handleSignup 호출됨")
    if (!validateForm()) {
      console.log("유효성 검증 실패");
      return;
    }

    try {
      const formData = new FormData();
      if (profileFile) {
        formData.append("profileImage", profileFile);
      }

      formData.append(
        "signupInfo",
        new Blob([JSON.stringify(form)], {
          type: "application/json",
        })
      );

      console.log("폼데이터 확인:", formData);
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await signupUser(formData);
      console.log("회원가입 응답:", res);
      
      navigate("/signup-complete");
    } catch (error) {
      console.error("회원가입 실패:", error);
    }
  };

  return (
    <div className="signup-page">
      {/* 배경 */}
      <img src={Signupvector} alt="" className="signup-background-vector" />

      <div className="signup-box">
        {/* 프로필 사진 업로드 */}
        <div className="profile-wrapper">
          <div className="profile-circle">
            {profilePreview ? (
              <img src={profilePreview} alt="profile" className="profile-image-full"/>
            ) : (
              <img src={Profile} alt="default-profile" className="profile-image-small"/>
            )}
            <button
              type="button"
              className="plus-button"
              onClick={() => fileInputRef.current?.click()}
            >+</button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleProfileUpload}
          />
        </div>

        {/* ==== 회원가입 폼 ==== */}
        <div className="signup-form">
          {/* 아이디 입력 */}
          <label htmlFor="loginId">아이디</label>
          <input 
            id="loginId"
            name="loginId" 
            value={form.loginId} 
            onChange={handleChange} 
            placeholder="|"/>
        </div>

        {/* 비밀번호 입력 */}
        <div className="signup-form">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="|"
          />
        </div>

        {/* 전화번호 입력 */}
        <div className="signup-form">
          <label htmlFor="phoneNumber">전화번호</label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="| 01012345678"
          />
        </div>

        {/* 이메일 입력 */}
        <div className="signup-form">
          <label htmlFor="email">이메일 주소</label>
          <input id="email" name="email" value={form.email} onChange={handleChange} 
          placeholder="|"/>
        </div>

        {/* 이름 입력 */}
        <div className="signup-form">
          <label htmlFor="name">이름</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} 
          placeholder="|"/>
        </div>

        {/* 생년월일 입력 */}
        <div className="signup-form">
          <label htmlFor="birthday">생년월일</label>
          <input
            id="birthday"
            type="date"
            name="birthday"
            value={form.birthday}
            onChange={handleChange}
          />
        </div>

        {/* 회원가입 버튼 */}
        <button className="signup-button" onClick={handleSignup} disabled={isLoading}>
          회원가입
        </button>
        
        {clientError && <p className="error-message">{clientError}</p>}
        {errorMessage && (<p className="error-message">{errorMessage}</p>)}
      </div>
    </div>
  );
};

export default Signup;