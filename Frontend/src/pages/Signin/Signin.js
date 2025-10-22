import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

import './Signin.css'; 
// 🛑 แก้ไข Path รูปภาพ: สมมติว่า assets อยู่เหนือ Folder ของ Signin.js
import backgroundImage from '../../assets/bg.png';
import logoImage from '../../assets/logoGetitdone.png';

const SigninPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(false); 

  const navigate = useNavigate(); 

  // 🛑 Logic 1: ถ้ามี token แล้ว ให้เด้งไปหน้า Home (ใช้ sessionStorage)
  useEffect(() => {
      const token = sessionStorage.getItem('token');
      if (token) {
          navigate('/home'); 
      }
  }, [navigate]);

  const handleSignin = async (e) => {
    e.preventDefault();
    setError(null); 
    setLoading(true);

    try {
        // 🛑 Logic 2: เชื่อมต่อ Backend ที่ Port 5000 (สอดคล้องกับ server)
        const response = await fetch('http://localhost:8000/api/auth/signin', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Signin Successful:', data);
            
            // 🛑 Logic 3: บันทึกข้อมูลการเข้าสู่ระบบลงใน sessionStorage
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('userId', data.userId);
            sessionStorage.setItem('username', username);
            
            navigate('/home'); 

        } else {
            setError(data.message || 'การเข้าสู่ระบบล้มเหลว กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน');
        }
    } catch (err) {
        console.error('Network Error:', err);
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (โปรดตรวจสอบว่า Backend รันอยู่)');
    } finally {
        setLoading(false); 
    }
  };

  // 🛑 UI Component: ใช้ Layout 2 Panel เดิม
  return (
    <div className="login-page">
      {/* Left Panel: Background */}
      <div 
        className="background-panel"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <h1 className="app-title-bg">GetItDone</h1>
      </div>

      {/* Right Panel: Sign In Form */}
      <div className="login-panel">
        <div className="login-form-container">
          
          {/* Logo and Title */}
          <div className="logo-and-title">
            <img src={logoImage} alt="GetItDone Logo" className="app-logo" />
            <span className="app-title-fg">GetItDone</span>
          </div>

          <h2>Nice to see you again</h2>

          <form onSubmit={handleSignin}>
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
            
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading} 
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <button 
              type="submit" 
              className="sign-in-button" 
              disabled={loading} 
            >
              {loading ? 'Processing...' : 'Sign in'}
            </button>
          </form>

          {/* Link to Sign Up */}
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

export default SigninPage;