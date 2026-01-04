import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeLayout from './layouts/HomeLayout';
import HomePage from './pages/HomePage/HomePage';
import EmptyLayout from "./layouts/EmptyLayout";
import MyPageOwner from "./pages/MyPage/MyPageOwner";
import StudyPage from "./pages/StudyPage/StudyPage";
import StudyCreatePage from "./pages/StudyCreatePage/StudyCreatePage";
import StudyDetailPage from "./pages/StudyDetailPage/StudyDetailPage";
import MyStudiesPage from "./pages/MyStudiesPage/MyStudiesPage";
import BoardListPage from "./pages/BoardPage/BoardListPage";
import MyPagePublic from "./pages/MyPage/MyPagePulic";
import BoardDetailPage from "./pages/BoardPage/BoardDetailPage";
import Login from "./pages/Login/Login";
import BoardCreatePage from "./pages/BoardPage/BoardCreatePage";
import BoardEditPage from './pages/BoardPage/BoardEditPage';
import { PostProvider } from './context/PostContext';

function App() {
  return (
    <BrowserRouter>
    <PostProvider>
      <Routes>
        {/*Navbar 있는 레이아웃 */}
        <Route element = {<HomeLayout />}>
          <Route path="/" element={<HomePage />}/>
          <Route path="/OwnerPage" element={<MyPageOwner />}/>
          <Route path="/" element={<HomePage />} />
          <Route path="/studies" element={<StudyPage />} />
          <Route path= "/publicPage" element={<MyPagePublic />} /> 
          <Route path="/studies" element={<StudyPage />} /> 
          <Route path="/studies/new" element={<StudyCreatePage />} />
          <Route path="/studies/:studyId" element={<StudyDetailPage />} />
          <Route path="/studies/my" element={<MyStudiesPage />} />
          <Route path= "/board" element={<BoardListPage />} />
          <Route path= "/board/:postId" element={<BoardDetailPage />} />
          <Route path= "/board/write" element={<BoardCreatePage />} />
          <Route path= "/board/edit/:postId" element={<BoardEditPage />} />
        </Route>

        {/* Navbar 없는 레이아웃 */}
        <Route element = {<EmptyLayout />}>
          {/*로그인, 회원가입 등 상단바 없으면 이쪽에 넣으시면 됩니다.*/}
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
      </PostProvider>
    </BrowserRouter>
  )
}
export default App;