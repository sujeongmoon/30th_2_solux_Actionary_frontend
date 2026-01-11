import React, { useEffect, useState } from "react";
import "./ColorPaletteModal.css";
;

interface Props {
  selectedColor: string;
  onConfirm: (color: string) => void;
  onClose: () => void;
}

const colors = ["#D29AFA", "#6BEBFF", "#9AFF5B", "#FFAD36", 
  "#FF8355", "#FCDF2F", "#FF3D2F", "#FF9E97"];

const ColorPaletteModal: React.FC<Props> = ({ selectedColor, onConfirm, onClose }) => {
  const [ current, setCurrent ] = useState(selectedColor);

  useEffect(() => {
    setCurrent(selectedColor);
  }, [selectedColor]);
  
  return (
    <div className="palette-modal">
      <h3 className="palette-title">색상</h3>
      <div className="palette-grid">
        {colors.map(c => (
          <div
            key={c}
            className={`palette-color ${
              current === c ? "selected" : ""
            }`}
            style={{ backgroundColor: c}}
            onClick={() => setCurrent(c)}
          />
        ))}
      </div>

      <button
        className="palette-confirm-btn"
        onClick={() => {
          onConfirm(current);
          onClose();
        }}
      >확인</button>
    </div>
  );
};

export default ColorPaletteModal;