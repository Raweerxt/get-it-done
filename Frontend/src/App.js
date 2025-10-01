import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import หน้า Component ทั้งหมด - แก้ไขโดยลบนามสกุลไฟล์ออก
import SigninPage from './Signin'; 
import SignupPage from './Signup'; 
import HomePage from './Home'; 
import './App.css'; // ต้องแน่ใจว่า import App.css อยู่

// 🛑 Component สำหรับป้องกันการเข้าถึงหน้าถ้ายังไม่ได้ Login
const ProtectedRoute = ({ children }) => {
  // ✅ แก้ไข: ตรวจสอบ Token ใน sessionStorage
  const isAuthenticated = sessionStorage.getItem('token'); 
  if (!isAuthenticated) {
    // ถ้าไม่มี Token ให้กลับไปหน้า Signin
    return <Navigate to="/signin" replace />;
  }
  return children;
};

// 🛑 Component สำหรับป้องกันไม่ให้เข้าหน้า Login/Signup ซ้ำซ้อน
const AuthRoute = ({ children }) => {
  // ✅ แก้ไข: ตรวจสอบ Token ใน sessionStorage
  const isAuthenticated = sessionStorage.getItem('token'); 
  if (isAuthenticated) {
    // ถ้ามี Token แล้ว ให้ไปหน้าหลัก
    return <Navigate to="/" replace />;
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

          {/* Protected Route - หน้าหลัก */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage /> 
              </ProtectedRoute>
            } 
          />

          {/* Fallback Route: ถ้าไม่มี Path ตรง ให้ไปหน้า Signin */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
          
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;