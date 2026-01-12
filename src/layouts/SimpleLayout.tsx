import { Outlet } from "react-router-dom";
import SimpleNavbar from "../components/Navbar/SimpleNavbar";
import RightSidebar from "../components/Sidebar/Sidebar";

const SimpleLayout = () => {
  return (
    <div className="layout">
       <header className="navbar-container">
        <SimpleNavbar />
      </header>

      <main className="main-container">
        <Outlet />
      </main>
      <RightSidebar />
    </div>
  );
};

export default SimpleLayout;