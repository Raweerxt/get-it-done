import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; 
import SettingsButton from '../components/Button/Setting'; 
import { BookText, Home, Flame } from 'lucide-react'; 

// 💡 HomePage รับ Props ทั้งหมดจาก App.js
const HomePage = ({
    currentBackgroundUrl, 
    handleBackgroundSelect,
    currentSoundUrl,
    volume,
    isPlaying,
    handleSoundSelect,
    handleVolumeChange,
}) => {
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
        
        return thaiTime.substring(0, 5);
    };

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const storedUsername = sessionStorage.getItem('username');

        if (!token || !storedUsername) {
            navigate('/signin'); 
            return; 
        }
        
        try {
            const firstWordUsername = storedUsername.split(' ')[0];
            setUserName(firstWordUsername);
        } catch (error) {
            setUserName('User');
        }

        setCurrentTime(getThaiTime());

        const timerId = setInterval(() => {
            setCurrentTime(getThaiTime());
        }, 1000);

        return () => {
            clearInterval(timerId);
        };
        
    }, [navigate]);

    return (
        // 🛑 ลบ style={{ backgroundImage... }} ออกจาก div.home-page-container 
        // เพราะ App.js ตั้งค่าที่ document.documentElement แล้ว
        <div className="home-page-container">
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
                <h1 className="homepage-title">Hurry Up, It's time to Get It Done!</h1>
                
                <div className="timer-display">
                    {currentTime || '00:00'} 
                </div>
            </main>
            
            {/* Footer / Bottom Navigation */}
            <footer className="home-footer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                
                {/* Left Side Icons (Modals/Controls) - ถูกย้ายไป App.js แล้ว */}
                <div className="footer-icons">
                    {/* ว่างเปล่า */}
                </div>

                {/* Right Side Icons (Navigation) */}
                <div className="footer-icons">
                    <button className="footer-icon-button" title="Focus" onClick={() => navigate('/focus')}><BookText size={24} color="#FFF" /></button>
                    <button className="footer-icon-button" title="Home" onClick={() => navigate('/home')}><Home size={24} color="#FFF" /></button>
                    <button className="footer-icon-button" title="Streak" onClick={() => navigate('/streak')}><Flame size={24} color="#FFF" /></button>
                    <SettingsButton /> 
                </div>
            </footer>
            
        </div>
    );
};

export default HomePage;