import React from "react";
import { useNavigate } from "react-router-dom";
import PlusButton from "../../assets/homepage/PlusButton.svg";
import MainPageLogo from "../../assets/homepage/MainPageLogo.svg";
import './CTAbox.css';

interface CTABoxProps {
  isLoggedIn: boolean;
  nickname?: string;
}

const CTABox: React.FC<CTABoxProps> = ({ isLoggedIn, nickname }) => {
  const navigate = useNavigate();

  const handlePlusClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate("/studies/new");
  };
  

  return (
    <div className="cta-section">
      {isLoggedIn && (
        <div className="cta-header-row">
          <h2 className="cta-title">
            <span className="cta-nickname">{nickname}</span>{"  "} 의 스터디
          </h2>
      </div>
      )}

      <div className="cta-container">
        <div className="cta-plus-button" onClick={handlePlusClick}>
          <img className="cta-plus-button-img" src={PlusButton} alt="플러스 버튼" />
        </div>
        <p className="cta-text">
          <img src={MainPageLogo} alt="Actionary Logo" className="cta-logo" /> 
          지금 로그인 하고, 나만의 스터디를 만들어보세요!
        </p>
      </div>
    </div>
  );
};

export default CTABox;