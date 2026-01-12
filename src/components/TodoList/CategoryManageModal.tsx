import React, { useState } from "react";
import './CategoryManageModal.css';
import { useTodoCategories } from "../../hooks/useTodoCategories";
import CategoryEditModal from "./CategoryEditModal";

interface Props {
  onClose:() => void;
}

const CategoryManageModal: React.FC<Props> = ({ onClose }) => {
  const { categories } = useTodoCategories();
  const [selectedCategory, setSelectedCategory] = useState<null | {
    categoryId: number;
    name: string;
    color: string;
  }>(null);

  return (
    <>
      <div 
        className="catMmodal-overlay"
        onClick={onClose}>
        <div className="manage-modal">
          <h2 className="catmodal-title">카테고리 관리</h2>
          <div className="catM-divider" />

          <div className="category-grid">
            {categories.map((cat) => (
              <div
                key={cat.categoryId}
                className="category-pill"
                style={{borderColor: cat.color, color: cat.color}}
                onClick={() => {
                  setSelectedCategory({
                    categoryId: cat.categoryId,
                    name: cat.name,
                    color: cat.color,
                  });
                }}
              >
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedCategory && (
        <CategoryEditModal
          categoryId={selectedCategory.categoryId}
          initialName={selectedCategory.name}
          initialColor={selectedCategory.color}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </>
  );
};

export default CategoryManageModal;