import React, { useState } from "react";
import "./CategoryCreateModal.css";
import { useTodoCategoriesContext } from "../../context/TodoCategoriesContext";
import ColorPaletteModal from "./ColorPaletteModal";

interface Props {
  onClose: () => void;
  selectedDate: string;
}

const CategoryCreateModal: React.FC<Props> = ({ onClose, selectedDate }) => {
  const { addCategory } = useTodoCategoriesContext();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#ff3d2f");
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await addCategory({ name, color, startDate: selectedDate });
    onClose();
  };

  return (
    <div className="catCmodal-backdrop" onClick={onClose}>
      <div 
        className="catCmodal"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="catmodal-title">카테고리 등록</h2>
        <div className="catC-divider" />

        <input
          className="category-input"
          placeholder="| 카테고리 입력"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="catC-color-divider" />

        <div className="catC-color-row">
          <span>색상</span>
          <div className="color-picker-wrapper">
            <button
              className="color-circle"
              style={{ backgroundColor: color}}
              onClick={() => setPaletteOpen(true)}
            />
            {paletteOpen && (
              <ColorPaletteModal
              selectedColor={color}
              onConfirm={(selected)=> {
                setColor(selected);
                setPaletteOpen(false);
              }}
              onClose={() => setPaletteOpen(false)}
            />
            )}
          </div>
        </div>

        <button className="catC-confirm-btn" onClick={handleSubmit}>
          확인
        </button>
      </div>
    </div>
  );
};

export default CategoryCreateModal;
