import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeLayout from './layouts/HomeLayout';
import HomePage from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*Navbar 있는 레이아웃 */}
        <Route element = {<HomeLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Navbar 없는 레이아웃 */}
        {/*로그인, 회원가입은 이쪽에 넣으시면 됩니다.*/}
      </Routes>
    </BrowserRouter>
  )
}

export default App;