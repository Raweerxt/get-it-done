import React, { useState } from 'react';
import './Signin.css';

// 1. นำเข้ารูปภาพโดยตรง
import backgroundImage from './assets/bg.png'; 
import logoImage from './assets/logoGetitdone.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // โค้ดสำหรับส่งข้อมูลไปยัง API
    console.log('Attempting to log in with:', { username, password });
    alert(`Login attempt for user: ${username}`);
  };

  return (
    <div className="login-page">
      {/* 2. ใช้รูปภาพที่ import มา ใส่ใน style prop ของ background-panel
        เพื่อให้ Webpack จัดการ path ของรูปภาพได้อย่างถูกต้อง
      */}
      <div 
        className="background-panel"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <h1 className="app-title-bg">GetItDone</h1>
      </div>

      <div className="login-panel">
        <div className="login-form-container">
          <div className="logo-and-title">
            <img src={logoImage} alt="GetItDone Logo" className="app-logo" />
            <span className="app-title-fg">GetItDone</span>
          </div>

          <h2>Nice to see you again</h2>

          <form onSubmit={handleLogin}>
            <label htmlFor="username">Login</label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="sign-in-button">
              Sign in
            </button>
          </form>

          <p className="signup-link-text">
            Don't have an account?{' '}
            <a href="/signup" className="signup-link">
              Sign up now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;