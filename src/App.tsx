import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PostProvider } from "./context/PostContext";
import HomeLayout from './layouts/HomeLayout';
import HomePage from './pages/HomePage/HomePage';
import EmptyLayout from "./layouts/EmptyLayout";
import MyPageOwner from "./pages/MyPage/MyPageOwner";
import StudyPage from "./pages/StudyPage/StudyPage";
import StudyCreatePage from "./pages/StudyCreatePage/StudyCreatePage";
import StudyDetailPage from "./pages/StudyDetailPage/StudyDetailPage";
import MyStudiesPage from "./pages/MyStudiesPage/MyStudiesPage";
import StudyRoomPage from "./pages/StudyRoom/StudyRoomPage";
import BoardListPage from "./pages/BoardPage/BoardListPage";
import MyPagePublic from "./pages/MyPage/MyPagePulic";
import BoardDetailPage from "./pages/BoardPage/BoardDetailPage";
import Login from "./pages/Login/Login";
import BoardCreatePage from "./pages/BoardPage/BoardCreatePage";
import BoardEditPage from './pages/BoardPage/BoardEditPage';
import StudyTime from './pages/StudyTime/StudyTime';
import RightSidebar from "./components/Sidebar/Sidebar";
import ChatRoom from './pages/ChatRoom/ChatRoom';
import Signup from "./pages/Siginup/Signup";
import SignupComplete from "./pages/Siginup/SignupComplete";
import TodoListPage from "./pages/TodoListPage/TodoListPage";
import SearchBoard from "./pages/SearchPage/SearchBoard";
import AllSearch from './pages/SearchPage/AllSearch';
import SearchStudy from "./pages/SearchPage/SearchStudy";
import { TodoCategoriesProvider } from "./context/TodoCategoriesContext";


function App() {
  return (
    <AuthProvider>
    <PostProvider>
    <BrowserRouter>
    <TodoCategoriesProvider>
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
          <Route path="/study-room/:studyId" element={<StudyRoomPage />} />
          <Route path= "/board" element={<BoardListPage />} />
          <Route path= "/board/:postId" element={<BoardDetailPage />} />
          <Route path= "/board/write" element={<BoardCreatePage />} />
          <Route path= "/board/edit/:postId" element={<BoardEditPage />} />
          <Route path = "/studyTime" element={<StudyTime />} />
          <Route path = "/todolistpage" element={<TodoListPage />} />
          <Route path = "/chatroom" element={<ChatRoom />} />
          <Route path= "/search/board" element={<SearchBoard /> } />
          <Route path = "/search/all" element={<AllSearch />} />
          <Route path="/search/study" element={<SearchStudy />} />
        </Route>

        {/* Navbar 없는 레이아웃 */}
        <Route element = {<EmptyLayout />}>
          {/*로그인, 회원가입 등 상단바 없으면 이쪽에 넣으시면 됩니다.*/}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/complete" element={<SignupComplete />} />
        </Route>
      </Routes>

      <RightSidebar />
    </TodoCategoriesProvider>
    </BrowserRouter>
    </PostProvider>
    </AuthProvider>
  )
}
export default App;