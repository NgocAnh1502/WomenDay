import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GreetingPage from './pages/GreetingPage';
import Page1207 from './pages/special/Page1207';
import Page1708 from './pages/special/Page1708';
import Page1311 from './pages/special/Page1311';
import Page0607 from './pages/special/Page0607';
import './App.css';

function App() {
  return (
    <div className="app">
      <Routes>
        {/* Trang đăng nhập */}
        <Route path="/" element={<LoginPage />} />

        {/* 4 trang riêng biệt cho 4 mã đặc biệt */}
        <Route path="/special/1207" element={<Page1207 />} />
        <Route path="/special/1708" element={<Page1708 />} />
        <Route path="/special/1311" element={<Page1311 />} />
        <Route path="/special/0607" element={<Page0607 />} />

        {/* Trang lời chúc chung */}
        <Route path="/greeting" element={<GreetingPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
