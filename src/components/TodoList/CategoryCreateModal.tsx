import React, { useState } from "react";
import "./CategoryCreateModal.css";
import { useTodoCategories } from "../../hooks/useTodoCategories";
import ColorPaletteModal from "./ColorPaletteModal";

interface Props {
  onClose: () => void;
}

const CategoryCreateModal: React.FC<Props> = ({ onClose }) => {
  const { addCategory } = useTodoCategories();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#4F46E5");
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await addCategory({ name, color });
    onClose();
  };

  return (
    <div className="catCmodal-backdrop">
      <div className="catCmodal">
        <h2 className="catmodal-title">카테고리 등록</h2>
        <div className="catC-divider" />

        <input
          className="category-input"
          placeholder="카테고리 입력"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="divider" />

        <div className="catC-color-row">
          <span>색상</span>
          <button
            className="color-circle"
            style={{ backgroundColor: color}}
            onClick={() => setPaletteOpen(true)}
          />
        </div>

        <button className="catC-confirm-btn" onClick={handleSubmit}>
          확인
        </button>
      </div>

      {paletteOpen && (
        <ColorPaletteModal
          onSelect={(c) => {
            setColor(c);
            setPaletteOpen(false);
          }}
          onClose={() => setPaletteOpen(false)}
        />
      )}
    </div>
  );
};

export default CategoryCreateModal;
