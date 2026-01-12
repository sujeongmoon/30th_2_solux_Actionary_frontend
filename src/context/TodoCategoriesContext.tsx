import React, { createContext, useContext } from "react";
import { useTodoCategories } from "../hooks/useTodoCategories";

const TodoCategoriesContext = createContext<
  ReturnType<typeof useTodoCategories> | null
>(null);

/** ✅ Provider */
export const TodoCategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const categoriesState = useTodoCategories();

  return (
    <TodoCategoriesContext.Provider value={categoriesState}>
      {children}
    </TodoCategoriesContext.Provider>
  );
};

/** ✅ Context Hook */
export const useTodoCategoriesContext = () => {
  const context = useContext(TodoCategoriesContext);
  if (!context) {
    throw new Error("TodoCategoriesProvider로 감싸지지 않았습니다.");
  }
  return context;
};
