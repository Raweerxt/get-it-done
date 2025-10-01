import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; 
import backgroundImage from './assets/bg.png'; 
// ✅ นำเข้า SettingsButton Component จากที่ตั้งที่ถูกต้อง
import SettingsButton from './Button/Setting'; 
// 🛑 นำเข้า Icon ที่จำเป็นสำหรับ Footer Icons ที่เหลือ
import { Music, Image, BookText, Home, Flame } from 'lucide-react'; 

const HomePage = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [currentTime, setCurrentTime] = useState(''); 

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
        
        // 🛑 ปรับการแสดงผลให้แสดงเฉพาะ ชั่วโมง:นาที (HH:MM) 
        return thaiTime.substring(0, 5);
    };

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const storedUsername = sessionStorage.getItem('username');

        // 🛑 ป้องกันการเข้าถึง: หากไม่มี Token หรือ Username ให้เด้งไปหน้า Sign In
        if (!token || !storedUsername) {
            console.warn('Authentication failed: Missing token or username.');
            navigate('/signin'); 
            return; 
        }
        
        // 1. ตั้งค่า Username 
        try {
            // เอาแค่คำแรกของ Username มาแสดง
            const firstWordUsername = storedUsername.split(' ')[0];
            setUserName(firstWordUsername);
        } catch (error) {
            console.error('Error processing stored username:', error);
            setUserName('User');
        }

        // 2. ตั้งค่าและเริ่ม Timer (Clock)
        setCurrentTime(getThaiTime());

        const timerId = setInterval(() => {
            setCurrentTime(getThaiTime());
        }, 1000);

        // Cleanup Function
        return () => {
            clearInterval(timerId);
        };
        
    }, [navigate]);

    // ฟังก์ชันสำหรับจำลองการนำทาง (เนื่องจากตอนนี้ยังไม่มีหน้าอื่น)
    const handleNavClick = (path) => {
        console.log(`Navigating to ${path}`);
        // navigate(path); // เปิดใช้งานเมื่อมี path อื่นๆ เช่น /tasks
    };

    return (
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
            </header>

            {/* Main Content: Timer */}
            <main className="home-main-content">
                <p className="welcome-text">Hello, {userName || 'User'}</p> 
                <h1 className="homepage-title">This is Homepage Armageddon</h1>
                
                {/* Timer Display */}
                <div className="timer-display">
                    {/* 🛑 แสดงแค่ HH:MM */}
                    {currentTime.substring(0, 5) || '00:00'} 
                </div>
            </main>
            
            {/* Footer / Navigation Icons */}
            <footer className="home-footer">
                
                {/* Left Side Icons */}
                <div className="footer-icons">
                    <button className="footer-icon-button" title="Music" onClick={() => handleNavClick('/music')}><Music size={24} color="#FFF" /></button>
                    <button className="footer-icon-button" title="Image" onClick={() => handleNavClick('/image')}><Image size={24} color="#FFF" /></button>
                </div>

                {/* Right Side Icons (Navigation) */}
                <div className="footer-icons">
                    <button className="footer-icon-button" title="Focus" onClick={() => handleNavClick('/focus')}><BookText size={24} color="#FFF" /></button>
                    <button className="footer-icon-button" title="Home" onClick={() => handleNavClick('/home')}><Home size={24} color="#FFF" /></button>
                    <button className="footer-icon-button" title="Streak" onClick={() => handleNavClick('/streak')}><Flame size={24} color="#FFF" /></button>
                    {/* ✅ SettingsButton ถูกย้ายมาอยู่ที่นี่แล้ว */}
                    <SettingsButton /> 
                </div>
            </footer>
        </div>
    );
};

export default HomePage;