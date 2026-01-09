import React from "react";
import './CategoryManageModal.css';
import { useTodoCategories } from "../../hooks/useTodoCategories";

interface Props {
  onClose:() => void;
}

const CategoryManageModal: React.FC<Props> = ({ onClose }) => {
  const { categories } = useTodoCategories();

  return (
    <div className="catMmodal-overlay">
      <div className="manage-modal">
        <h2 className="catmodal-title">카테고리 관리</h2>
        <div className="catM-divider" />

        <div className="category-grid">
          {categories.map(cat => (
            <div
              key={cat.categoryId}
              className="category-pill"
              style={{borderColor: cat.color, color: cat.color}}
              onClick={() => {
                console.log("선택된 카테고리:", cat.name);

                onClose();
              }}
            >
              {cat.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryManageModal;