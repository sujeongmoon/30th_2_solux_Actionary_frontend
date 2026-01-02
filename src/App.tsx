import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeLayout from './layouts/HomeLayout';
import HomePage from './pages/HomePage/HomePage';
import EmptyLayout from "./layouts/EmptyLayout";
import StudyPage from "./pages/StudyPage/StudyPage";
import StudyCreatePage from "./pages/StudyCreatePage/StudyCreatePage";
import StudyDetailPage from "./pages/StudyDetailPage/StudyDetailPage";
import MyStudiesPage from "./pages/MyStudiesPage/MyStudiesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*Navbar 있는 레이아웃 */}
        <Route element = {<HomeLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/studies" element={<StudyPage />} /> 
          <Route path="/studies/new" element={<StudyCreatePage />} />
          <Route path="/studies/:studyId" element={<StudyDetailPage />} />
          <Route path="/studies/my" element={<MyStudiesPage />} />
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