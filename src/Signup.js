import React, { useState } from 'react';
import './Signin.css'; // ใช้ CSS เดิมเพื่อให้ได้สไตล์ที่เข้ากัน

// นำเข้ารูปภาพโดยตรง (ใช้รูปเดิมกับ Signin)
import backgroundImage from './assets/bg.png';
import logoImage from './assets/logoGetitdone.png';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();
    
    // 1. ตรวจสอบรหัสผ่านว่าตรงกันหรือไม่
    if (password !== confirmPassword) {
      alert('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน!');
      return;
    }
    
    // 2. ตรวจสอบเงื่อนไขอื่น ๆ (เช่น ความยาวรหัสผ่าน)
    if (password.length < 6) {
        alert('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        return;
    }

    // 3. โค้ดสำหรับส่งข้อมูลไปยัง API (เช่น POST /api/signup)
    console.log('Attempting to sign up with:', { username, password });
    
    // TODO: เพิ่มโค้ด fetch/axios เพื่อส่งข้อมูลไปยัง Backend
    alert(`Signup attempt for user: ${username}`);
    
    // ล้างฟอร์ม
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login-page">
      {/* แผงด้านซ้าย: Background */}
      <div 
        className="background-panel"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <h1 className="app-title-bg">GetItDone</h1>
      </div>

      {/* แผงด้านขวา: Sign Up Form */}
      <div className="login-panel">
        <div className="login-form-container">
          
          {/* โลโก้และชื่อแอป */}
          <div className="logo-and-title">
            <img src={logoImage} alt="GetItDone Logo" className="app-logo" />
            <span className="app-title-fg">GetItDone</span>
          </div>

          {/* ข้อความต้อนรับใหม่ */}
          <h2>Create your account</h2>

          <form onSubmit={handleSignup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            {/* ช่องใส่ Email ถูกลบออกไปแล้ว */}

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit" className="sign-in-button">
              Sign up
            </button>
          </form>

          {/* ลิงก์กลับไปหน้า Sign In */}
          <p className="signup-link-text">
            Already have an account?{' '}
            <a href="/signin" className="signup-link">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;