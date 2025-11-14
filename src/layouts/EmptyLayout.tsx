import { Outlet } from "react-router-dom";

const EmptyLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* 여기에 Navbar나 Footer 없음 */}
      <Outlet />
    </div>
  );
};

export default EmptyLayout;
