import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const HomeLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 상단 네비게이션 */}
      <Navbar />

      {/* 메인 콘텐츠 영역 (Outlet이 페이지별 내용이 들어가는 자리) */}
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default HomeLayout;
