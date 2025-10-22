import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import หน้า Component ทั้งหมด - แก้ไขโดยลบนามสกุลไฟล์ออก
import SigninPage from './pages/Signin/Signin'; 
import SignupPage from './pages/Signup/Signup'; 
import HomePage from './pages/Home'; 
import './App.css'; // ต้องแน่ใจว่า import App.css อยู่
import FocusPage from './pages/Focus/Focus';

// 🛑 Component สำหรับป้องกันการเข้าถึงหน้าถ้ายังไม่ได้ Login
const ProtectedRoute = ({ children }) => {
  // ✅ ใช้ sessionStorage เพื่อไม่เก็บสถานะถาวร
  const isAuthenticated = sessionStorage.getItem('token'); 
  if (!isAuthenticated) {
    // ถ้าไม่มี Token ให้กลับไปหน้า Signin
    return <Navigate to="/signin" replace />;
  }
  return children;
};

// 🛑 Component สำหรับป้องกันไม่ให้เข้าหน้า Login/Signup ซ้ำซ้อน
const AuthRoute = ({ children }) => {
  // ✅ ใช้ sessionStorage เพื่อความสอดคล้อง
  const isAuthenticated = sessionStorage.getItem('token'); 
  if (isAuthenticated) {
    // ถ้ามี Token แล้ว ให้ไปหน้า Home โดยอัตโนมัติ
    return <Navigate to="/home" replace />;
  }
  return children;
};

const App = () => {
  return (
    // <BrowserRouter> คือหัวใจของการจัดการเส้นทาง
    <BrowserRouter>
      {/* 🛑 div className="App" อาจทำให้ UI เพี้ยนได้ (ดูหมายเหตุ) */}
      <div className="App"> 
        <Routes>
          
          {/* Public Routes - Signin และ Signup */}
          <Route 
            path="/signin" 
            element={
              <AuthRoute>
                <SigninPage />
              </AuthRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <AuthRoute>
                <SignupPage />
              </AuthRoute>
            } 
          />

          {/* Protected Route - Home */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <HomePage /> 
              </ProtectedRoute>
            } 
          />

<<<<<<< HEAD
=======
          <Route 
            path="/focus" 
            element={
              <ProtectedRoute>
                <FocusPage /> 
              </ProtectedRoute>
            } 
          />

>>>>>>> 198c3e35a0f59b3e66e6d9ee0ef476b8a9da9e9b
          {/* Default & Fallback: ให้เข้า Signin เสมอก่อน */}
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
          
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;