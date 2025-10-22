import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // ใช้ CSS เดียวกับ Signin เพื่อความสอดคล้องของ Layout

// 🛑 แก้ไข Path รูปภาพ: สมมติว่า assets อยู่เหนือ Folder ของ Signup.js
import backgroundImage from '../../assets/bg.png';
import logoImage from '../../assets/logoGetitdone.png';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
        setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        setLoading(false);
        return;
    }

    try {
        // 🛑 เชื่อมต่อ Backend ที่ Port 5000 (สอดคล้องกับ server)
        const response = await fetch('http://localhost:8000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Signup Successful:', data.message);
            // เมื่อสมัครสำเร็จ ให้พาไปหน้า Login
            navigate('/signin');

        } else {
            setError(data.message || 'การสมัครสมาชิกไม่สำเร็จ โปรดลองอีกครั้ง');
        }
    } catch (err) {
        console.error('Network Error:', err);
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
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

      {/* Right Panel: Sign Up Form */}
      <div className="login-panel">
        <div className="login-form-container">
          
          {/* Logo and Title */}
          <div className="logo-and-title">
            <img src={logoImage} alt="GetItDone Logo" className="app-logo" />
            <span className="app-title-fg">GetItDone</span>
          </div>

          <h2>Create Your Account</h2>

          <form onSubmit={handleSignup}>
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />

            <button
              type="submit"
              className="sign-in-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Sign up'}
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