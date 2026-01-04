import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeLayout from "./layouts/HomeLayout";
import HomePage from "./pages/HomePage/HomePage";
import EmptyLayout from "./layouts/EmptyLayout";
import MyPageOwner from "./pages/MyPage/MyPageOwner";
import StudyPage from "./pages/StudyPage/StudyPage";
import StudyCreatePage from "./pages/StudyCreatePage/StudyCreatePage";
import BoardListPage from "./pages/BoardPage/BoardListPage";
import Login from "./pages/Login/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Navbar 있는 레이아웃 */}
        <Route element={<HomeLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/OwnerPage" element={<MyPageOwner />} />
          <Route path="/studies" element={<StudyPage />} />
          <Route path="/studies/new" element={<StudyCreatePage />} />
          <Route path="/board" element={<BoardListPage />} />
        </Route>

        {/* Navbar 없는 레이아웃 */}
        <Route element={<EmptyLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;