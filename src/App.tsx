import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeLayout from './layouts/HomeLayout';
import HomePage from './pages/HomePage/HomePage';
import EmptyLayout from "./layouts/EmptyLayout";
import MyPageOwner from "./pages/MyPage/MyPageOwner";
import StudyPage from "./pages/StudyPage/StudyPage";
import BoardListPage from "./pages/BoardPage/BoardListPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*Navbar 있는 레이아웃 */}
        <Route element = {<HomeLayout />}>
          <Route path="/" element={<HomePage />}/>
          <Route path="/OwnerPage" element={<MyPageOwner />}/>
          <Route path="/" element={<HomePage />} />
          <Route path="/studies" element={<StudyPage />} /> 
          <Route path= "/board" element={<BoardListPage />} />
        </Route>

        {/* Navbar 없는 레이아웃 */}
        <Route element = {<EmptyLayout />}>
          {/*로그인, 회원가입 등 상단바 없으면 이쪽에 넣으시면 됩니다.*/}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;