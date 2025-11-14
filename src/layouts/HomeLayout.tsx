import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./HomeLayout.css"; 

const HomeLayout = () => {
  return (
    <div className="layout">
      <header className="navbar-container">
        <Navbar />
      </header>

      <main className="main-container">
        <Outlet />
      </main>
    </div>
  );
};

export default HomeLayout;
