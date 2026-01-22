import React, { useState } from "react";
import "./CategoryCreateModal.css";
import ColorPaletteModal from "./ColorPaletteModal";
import { useTodoCategoriesContext } from "../../context/TodoCategoriesContext";

interface Props {
  categoryId: number;
  initialName: string;
  initialColor: string;
  onClose: () => void;
}

const CategoryEditModal: React.FC<Props> = ({
  categoryId,
  initialName,
  initialColor,
  onClose,
}) => {
  const { editCategory, removeCategory } = useTodoCategoriesContext();

  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) return;

    await editCategory(categoryId, {
      name,
      color,
    });

    onClose();
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("카테고리를 삭제하겠습니까?");
    if (!confirmDelete) return;
    try {
      await removeCategory(categoryId);
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert("이 카테고리에 등록된 투두가 있어 삭제할 수 없습니다.\n먼저 투두를 다른 카테고리로 이동하거나 삭제해주세요.");
      } else {
        alert("카테고리 삭제에 실패했습니다.");
      }
    }

  };

  return (
    <div 
      className="catCmodal-backdrop"
      onClick={onClose}
    >
      <div className="catCmodal" onClick={(e) => e.stopPropagation()}>
        <h2 className="catEmodal-title">카테고리</h2>
        <div className="catC-divider" />

        <input
          className="category-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="catC-color-divider" />

        <div className="catC-color-row">
          <span>색상</span>

          <div className="color-picker-wrapper">
            <button
              className="color-circle"
              style={{ backgroundColor: color }}
              onClick={() => setPaletteOpen(true)}
            />

            {paletteOpen && (
              <ColorPaletteModal
                selectedColor={color}
                onConfirm={(selected) => {
                  setColor(selected); 
                  setPaletteOpen(false);
                }}
                onClose={() => setPaletteOpen(false)} 
              />
            )}
          </div>
        </div>

        <div className="catE-btn-row">
          <button className="catE-edit-btn" onClick={handleUpdate}>
            수정
          </button>

          <button className="catE-delete-btn" onClick={handleDelete}>
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryEditModal;
