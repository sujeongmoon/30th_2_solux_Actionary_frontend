import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import "./HomeLayout.css"; 
import RightSidebar from "../components/Sidebar/Sidebar";

const HomeLayout = () => {
  const location= useLocation();
  const hideSidebar = location.pathname.startsWith("/study-room");
  return (
    <div className="layout">
      <header className="navbar-container">
        <Navbar />
      </header>

      <main className="main-container">
        <Outlet />
      </main>

      {!hideSidebar && <RightSidebar />}
    </div>
  );
};

export default HomeLayout;
