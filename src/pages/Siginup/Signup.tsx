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
    
    loginId: "",
    password: "",
    phoneNumber: "",
    email: "",
    name: "",
    birthday: "",
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

    if (profilePreview) {
      URL.revokeObjectURL(profilePreview);
    }
    
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  /* 회원가입 */
  const handleSignup = async () => {
    try {
      const formData = new FormData();
      if (profileFile) {
        formData.append("profile_image", profileFile);
      }

      formData.append("loginId", form.loginId);
      formData.append("password", form.password);
      formData.append("phoneNumber", form.phoneNumber);
      formData.append("email", form.email);
      formData.append("name", form.name);
      formData.append("birthday", form.birthday);

      await signupUser(formData);

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
          <label>아이디</label>
          <input name="loginId" value={form.loginId} onChange={handleChange} 
          placeholder="|"/>
        </div>

        {/* 비밀번호 입력 */}
        <div className="signup-form">
          <label>비밀번호</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="|"
          />
        </div>

        {/* 전화번호 입력 */}
        <div className="signup-form">
          <label>전화번호</label>
          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="| 01012345678"
          />
        </div>

        {/* 이메일 입력 */}
        <div className="signup-form">
          <label>이메일 주소</label>
          <input name="email" value={form.email} onChange={handleChange} 
          placeholder="|"/>
        </div>

        {/* 이름 입력 */}
        <div className="signup-form">
          <label>이름</label>
          <input name="name" value={form.name} onChange={handleChange} 
          placeholder="|"/>
        </div>

        {/* 생년월일 입력 */}
        <div className="signup-form">
          <label>생년월일</label>
          <input
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

        {errorMessage && (<p className="error-message">{errorMessage}</p>)}
      </div>
    </div>
  );
};

export default Signup;