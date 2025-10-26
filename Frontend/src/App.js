import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Image, Volume2 } from 'lucide-react'; // 🛑 Import Icon สำหรับปุ่มควบคุม

// Import หน้า Component
import SigninPage from './pages/Signin/Signin'; 
import SignupPage from './pages/Signup/Signup'; 
import HomePage from './pages/Home'; 
import FocusPage from './pages/Focus/Focus';
import StreakPage from './pages/Streak/Streak';

// Import Global Components และ soundOptions/backgroundOptions
import AmbientSoundSelector, { soundOptions } from './components/Button/Sounds'; 
import BackgroundButton from './components/Button/SelectBg'; 

import './App.css'; 
import defaultBackgroundImage from './assets/bg.png';

// Component สำหรับป้องกันการเข้าถึงหน้าถ้ายังไม่ได้ Login
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('token'); 
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

// Component สำหรับป้องกันไม่ให้เข้าหน้า Login/Signup ซ้ำซ้อน
const AuthRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('token'); 
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

const App = () => {

    // ----------------------------------------------------
    // 🛑 1. BACKGROUND STATE & LOGIC
    // ----------------------------------------------------
    const defaultBgUrl = defaultBackgroundImage;
    const [currentBackground, setCurrentBackground] = useState(() => {
        return localStorage.getItem('selectedBackground') || defaultBgUrl;
    });
    const [isBgModalOpen, setIsBgModalOpen] = useState(false);

    const handleBackgroundSelect = (bgUrl) => {
        setCurrentBackground(bgUrl);
        localStorage.setItem('selectedBackground', bgUrl);
    };
    
    // ----------------------------------------------------
    // 🛑 2. SOUND STATE & LOGIC (แก้ไขลำดับการประกาศ)
    // ----------------------------------------------------
    
    // ✅ 1. ต้องประกาศตัวแปรนี้ก่อนที่จะนำไปใช้ใน useState ของ currentSoundUrl
    const firstSoundOption = soundOptions && soundOptions.length > 0 ? soundOptions[0] : { url: null, name: null };
    
    // ✅ 2. ประกาศ State หลักสำหรับ URL เสียง
    const [currentSoundUrl, setCurrentSoundUrl] = useState(() => {
        return localStorage.getItem('selectedSoundUrl') || firstSoundOption.url;
    });
    
    // 3. State/Ref อื่นๆ (สามารถประกาศตามมาได้)
    const [volume, setVolume] = useState(() => {
        const storedVolume = localStorage.getItem('ambientVolume');
        return storedVolume !== null ? parseFloat(storedVolume) : 0.5;
    });
    const [isPlaying, setIsPlaying] = useState(false); 
    const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
    
    const audioRef = useRef(null); 
    
    // ... (handleSoundSelect และ handleVolumeChange เหมือนเดิม) ...
    const handleSoundSelect = (soundOption) => {
        const { url } = soundOption;
        if (currentSoundUrl === url) {
             setIsPlaying(prev => !prev);
        } else {
             setCurrentSoundUrl(url); 
             localStorage.setItem('selectedSoundUrl', url);
             setIsPlaying(true); 
        }
    };

    const handleVolumeChange = (event) => {
        const newVolume = parseFloat(event.target.value) / 100; 
        setVolume(newVolume);
        localStorage.setItem('ambientVolume', newVolume);
    };


    // 🛑 Effect สำหรับใช้พื้นหลัง (ใช้ currentBackground)
    useEffect(() => {
        document.documentElement.style.backgroundImage = `url(${currentBackground})`;
        document.documentElement.style.backgroundSize = 'cover';
        document.documentElement.style.backgroundPosition = 'center';
        document.documentElement.style.backgroundAttachment = 'fixed';
        localStorage.setItem('selectedBackground', currentBackground);
    }, [currentBackground]);

    // 🛑 useEffect สำหรับควบคุม Audio (ใช้ currentSoundUrl, isPlaying, volume)
    useEffect(() => {
        if (!audioRef.current) {
            // ✅ currentSoundUrl ถูกประกาศแล้วที่ด้านบน ทำให้เรียกใช้ได้
            audioRef.current = new Audio(currentSoundUrl || ''); 
            audioRef.current.loop = true;
        }
        
        // ... (Logic ควบคุม Play/Pause) ...
        if (audioRef.current) {
            if (audioRef.current.src !== currentSoundUrl) {
                audioRef.current.src = currentSoundUrl || '';
                audioRef.current.load(); 
            }
            
            audioRef.current.volume = volume;

            if (isPlaying && currentSoundUrl) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error("Audio playback blocked:", error); 
                    });
                }
            } else {
                audioRef.current.pause();
            }
        }
        
    }, [currentSoundUrl, isPlaying, volume]); 

    // Cleanup Audio Element
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);


    // ----------------------------------------------------
    // 🛑 3. RENDER: Controls, Modal และ Routes
    // ----------------------------------------------------
    
    // ✅ ตัวแปร isAnySoundSelected ต้องถูกประกาศหลัง currentSoundUrl
    const isAnySoundSelected = !!currentSoundUrl;

    // 💡 ฟังก์ชันควบคุมการเปิด Modal เพื่อให้ Modal หนึ่งปิดเมื่ออีก Modal ถูกเปิด
    const toggleModal = (modalName) => {
        if (modalName === 'bg') {
            setIsBgModalOpen(prev => !prev);
            setIsSoundModalOpen(false); // ปิด Modal Sound ถ้าเปิด Modal Background
        } else if (modalName === 'sound') {
            setIsSoundModalOpen(prev => !prev);
            setIsBgModalOpen(false); // ปิด Modal Background ถ้าเปิด Modal Sound
        }
    };
    
    return (
        <BrowserRouter>
            <div className="App"> 
                
                {/* 💡 Container สำหรับ Controls และ Modal ที่ต้องแสดงผลทับทุกหน้า */}
                <div className="utility-fixed-container">
                    
                    {/* 🛑 ปุ่มควบคุมรวมกันที่นี่ (Footer Icons) */}
                    <div className="app-global-controls" style={{ display: 'flex', gap: '10px' }}>
                        {/* ปุ่ม Sound Button */}
                        <button 
                            className={`footer-icon-button ${isPlaying && isAnySoundSelected ? 'is-playing' : ''}`}
                            title="Ambient Sounds" 
                            
                            onClick={() => toggleModal('sound')} // ใช้ toggleModal
                        >
                            <Volume2 size={24} color="#FFF" />
                        </button>

                        {/* ปุ่ม Background Button */}
                        <button 
                            className="footer-icon-button" 
                            title="Change Background" 
                            
                            onClick={() => toggleModal('bg')} // ใช้ toggleModal
                        >
                            <Image size={24} color="#FFF" />
                        </button>
                        
                        
                    </div>

                    {/* 🛑 Modal Controls (แสดงผลเมื่อถูกเปิด) */}

                    {/* Modal Background */}
                    <BackgroundButton
                        onClick={() => setIsBgModalOpen(prev => !prev)} 
                        isOpen={isBgModalOpen}
                        onToggle={() => setIsBgModalOpen(false)} // ปิด Modal ด้วยปุ่ม X
                        onSelectBackground={handleBackgroundSelect}
                        currentBackgroundUrl={currentBackground} // 🛑 ส่ง URL ปัจจุบัน
                    />

                    {/* Modal Sound */}
                    <AmbientSoundSelector
                        onClick={() => setIsSoundModalOpen(prev => !prev)} 
                        isOpen={isSoundModalOpen}
                        onToggle={() => setIsSoundModalOpen(false)} 
                        currentSoundUrl={currentSoundUrl}
                        volume={volume}
                        isPlaying={isPlaying} // ส่ง isPlaying ไปด้วย
                        handleSelect={handleSoundSelect}
                        handleVolumeChange={handleVolumeChange}
                    />

                    

                </div>

                <Routes>
                    
                    {/* Routes */}
                    <Route path="/signin" element={<AuthRoute><SigninPage /></AuthRoute>} />
                    <Route path="/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />
                    <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} /> 
                    <Route path="/focus" element={<ProtectedRoute><FocusPage /></ProtectedRoute>} /> 
                    <Route path="/streak" element={<ProtectedRoute><StreakPage /></ProtectedRoute>} /> 

                    <Route path="/" element={<Navigate to="/signin" replace />} />
                    <Route path="*" element={<Navigate to="/signin" replace />} />
                    
                </Routes>
            </div>
        </BrowserRouter>
    );
};


export default App;