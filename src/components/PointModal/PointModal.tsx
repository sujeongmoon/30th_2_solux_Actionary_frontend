import React from "react";
import "./PointModal.css";

interface PointModalProps {
  earnedPoint: number | null;
  onClose: () => void;
}

const PointModal: React.FC<PointModalProps> = ({ earnedPoint, onClose }) => {
  if (earnedPoint === null) return null;

  return (
    <div className="point-modal-overlay">
      <div className="point-modal-box">
        <p className="point-modal-text">{earnedPoint}p가 쌓였습니다!</p>
        <button className="point-modal-button" onClick={onClose}>확인</button>
      </div>
    </div>
  );
};

export default PointModal;