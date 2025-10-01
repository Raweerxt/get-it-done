import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; 
import backgroundImage from './assets/bg.png'; 

const HomePage = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [currentTime, setCurrentTime] = useState(''); // State สำหรับเก็บเวลาปัจจุบัน

    // ฟังก์ชันสำหรับดึงเวลาปัจจุบันใน Time Zone ไทย
    const getThaiTime = () => {
        const now = new Date();
        const thaiTime = new Intl.DateTimeFormat('th-TH', {
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit', 
            hourCycle: 'h23', 
            timeZone: 'Asia/Bangkok'
        }).format(now);
        
        return thaiTime;
    };

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const storedUsername = sessionStorage.getItem('username');

        // 🛑 ป้องกันการเข้าถึง: หากไม่มี Token หรือ Username ให้เด้งไปหน้า Sign In
        if (!token || !storedUsername) {
             console.warn('Authentication failed: Missing token or username.');
             navigate('/signin'); 
             return; // หยุดการทำงานของ useEffect
        }
        
        // 1. ตั้งค่า Username ที่ได้จาก Local Storage
        // ✅ การแก้ไข: เพิ่ม try/catch เพื่อป้องกันไม่ให้โค้ดส่วนนาฬิกาหยุดทำงานหาก username มีปัญหา
        try {
            const firstWordUsername = storedUsername.split(' ')[0];
            setUserName(firstWordUsername);
        } catch (error) {
            console.error('Error processing stored username:', error);
            // ถ้าเกิด Error ให้ใช้ค่าเริ่มต้น เพื่อให้โค้ดส่วนอื่นทำงานต่อได้
            setUserName('Guest');
        }


        // 2. ตั้งค่าและเริ่ม Timer (Clock)
        setCurrentTime(getThaiTime());

        const timerId = setInterval(() => {
            setCurrentTime(getThaiTime());
        }, 1000);

        // Cleanup Function: ล้าง Interval เมื่อ Component ถูกยกเลิก
        return () => {
            clearInterval(timerId);
        };
        
    }, [navigate]);

    // ฟังก์ชันสำหรับจัดการการออกจากระบบ
    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('username'); // ลบ username ด้วย
        navigate('/signin');
    };
    
    return (
        // ใช้ style attribute เพื่อกำหนด background-image
        <div 
            className="home-page-container"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            
            {/* Header / Quote */}
            <header className="home-header">
                <div className="app-branding">
                    <span className="app-name">GetItDone</span>
                    <p className="app-subtitle">by Muk and Cream</p>
                </div>
                <div className="app-quote">
                    <p>"Strive for progress,</p>
                    <p>not perfection"</p>
                </div>
                <div>
                    <button 
                        onClick={handleLogout}
                        style={{
                            marginLeft: 'auto',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            background: '#fff',
                            cursor: 'pointer'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content: Timer */}
            <main className="home-main-content">
                {/* ⚠️ แสดง userName ที่ถูกตั้งค่า */}
                <p className="welcome-text">Hello, {userName || 'User'}</p> 
                <h1 className="homepage-title">This is Homepage Armageddon</h1>
                
                {/* Timer Display: แสดงเวลาไทยแบบเรียลไทม์ */}
                <div className="timer-display">
                    {currentTime || '00:00:00'} 
                </div>
            </main>
            
            {/* Footer / Navigation Icons */}
            <footer className="home-footer">
                
                {/* Left Side Icons (Mock-up) */}
                <div className="footer-icons">
                    <button className="footer-icon-button" title="Music"><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19l12 3M9 19C5.134 19 2 15.866 2 12s3.134-7 7-7" /></svg></button>
                    <button className="footer-icon-button" title="Image"><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
                </div>

                {/* Right Side Icons (Navigation) */}
                <div className="footer-icons">
                    <button className="footer-icon-button" title="Tasks"><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-8v8m-4-8v8M12 4v.01M12 20v.01M6 20v.01M6 4v.01M18 20v.01M18 4v.01M8 4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg></button>
                    <button className="footer-icon-button" title="Home" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6m-6 0h.01" /></svg></button>
                    <button className="footer-icon-button" title="Logout" onClick={handleLogout}><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12" /></svg></button>
                    <button className="footer-icon-button" title="Settings" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;