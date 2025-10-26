// fileName: Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; 
import backgroundImage from '../assets/bg.png'; 
import SettingsButton from '../components/Button/Setting'; 
// นำเข้า Icon ที่จำเป็น (ลบ PaintBucket ออก)
import { BookText, Home, Flame } from 'lucide-react'; 
// นำเข้า BackgroundButton Component ใหม่
import BackgroundButton from '../components/Button/SelectBg'; 
import AmbientSoundSelector from '../components/Button/Sounds';

const HomePage = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [currentTime, setCurrentTime] = useState(''); 

    // 1. State สำหรับ Background
    const defaultBgUrl = backgroundImage; 
    const [currentBackground, setCurrentBackground] = useState(() => {
        return sessionStorage.getItem('selectedBackground') || defaultBgUrl;
    }); 

    // 🛑 State ใหม่: ควบคุม Modal ที่กำลังเปิดอยู่ (สามารถเป็น 'background', 'sound', หรือ null)
    const [openModal, setOpenModal] = useState(null);
    
    // 2. ฟังก์ชัน Callback สำหรับเปลี่ยนพื้นหลัง
    const handleBackgroundSelect = (bgUrl) => {
        setCurrentBackground(bgUrl);
        sessionStorage.setItem('selectedBackground', bgUrl); 
    };

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

    // 🛑 ฟังก์ชันใหม่: ใช้เพื่อเปิด Modal
    const handleOpenModal = (modalName) => {
        // ถ้า Modal ที่กดซ้ำคืออันที่เปิดอยู่ ให้ปิดมัน
        if (openModal === modalName) {
            setOpenModal(null);
        } else {
            // เปิด Modal ใหม่
            setOpenModal(modalName);
        }
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

    const handleNavClick = (path) => {
        console.log(`Navigating to ${path}`);
    };

    return (
        <div 
            className="home-page-container"
            style={{ backgroundImage: `url(${currentBackground})` }}
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
                
                <div className="timer-display">
                    {currentTime.substring(0, 5) || '00:00'} 
                </div>
            </main>
            
            {/* Footer / Navigation Icons */}
            <footer className="home-footer">
                
                {/* Left Side Icons */}
                <div className="footer-icons">
                    {/* 🛑 เปลี่ยนปุ่ม Music เดิม เป็น AmbientSoundSelector */}
                    <AmbientSoundSelector
                        isOpen={openModal === 'sound'} // ส่งสถานะว่า Modal นี้ควรเปิดหรือไม่
                        onToggle={() => handleOpenModal('sound')} // ส่งฟังก์ชันสำหรับเปิด/ปิดตัวเอง
                    />
                    
                    {/* BackgroundButton */}
                    <BackgroundButton 
                        isOpen={openModal === 'background'} // ส่งสถานะว่า Modal นี้ควรเปิดหรือไม่
                        onToggle={() => handleOpenModal('background')} // ส่งฟังก์ชันสำหรับเปิด/ปิดตัวเอง
                        onSelectBackground={handleBackgroundSelect}
                    />
                    
                </div>

                {/* Right Side Icons (Navigation) */}
                <div className="footer-icons">
                    <button className="footer-icon-button" title="Focus" onClick={() => navigate('/focus')}><BookText size={24} color="#FFF" /></button>
                    <button className="footer-icon-button" title="Home" onClick={() => handleNavClick('/home')}><Home size={24} color="#FFF" /></button>
                    <button className="footer-icon-button" title="Streak" onClick={() => handleNavClick('/streak')}><Flame size={24} color="#FFF" /></button>
                    <SettingsButton /> 
                </div>
            </footer>
            
        </div>
    );
};

export default HomePage;