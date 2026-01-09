import React from "react";
import "./ColorPaletteModal.css";;

interface Props {
  onSelect: (color: string) => void;
  onClose: () => void;
}

const colors = ["#D29AFA", "#6BEBFF", "#9AFF5B", "#FFAD36", "#FF8355", "#FCDF2F", "#FF3D2F", "#FF9E97"];

const ColorPaletteModal: React.FC<Props> = ({ onSelect, onClose }) => {
  return (
    <div className="palmodal-overlay">
      <div className="palette-modal">
        {colors.map(c => (
          <div
            key={c}
            className="palette-color"
            style={{ backgroundColor: c}}
            onClick={() => {onSelect(c); onClose(); }}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPaletteModal;