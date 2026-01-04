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

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    profile_image_url: "",
    loginId: "",
    password: "",
    phoneNumber: "",
    email: "",
    name: "",
    birthday: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setProfileFile(file);
    const previewUrl = URL.createObjectURL(file);

    // 실제 서버 전송용 (지금은 URL로 처리)
    setProfilePreview(previewUrl);
    setForm ({
      ...form,
      profile_image_url: previewUrl,
    });
  }; 

  /* 회원가입 */
  const handleSginup = async () => {
    try {
      const formData = new FormData();
      if (profileFile) {
        formData.append("profile_image", profileFile);
      }

      await signupUser(form);

      navigate("/signup-complete");
    } catch {}
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
            accept="image/"
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
        <button className="signup-button" onClick={handleSginup} disabled={isLoading}>
          회원가입
        </button>

        {errorMessage && (<p className="error-message">{errorMessage}</p>)}
      </div>
    </div>
  );
};

export default Signup;