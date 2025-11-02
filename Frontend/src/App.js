import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Image, Volume2 } from 'lucide-react';

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


// ฟังก์ชันช่วยในการดึง User ID
const getUserId = () => {
    // ดึง 'userId' ที่ถูกบันทึกใน sessionStorage ตอนล็อกอิน
    return sessionStorage.getItem('userId'); 
};

//  ฟังก์ชันช่วยสร้าง Key ที่ผูกกับ User ID
const getStorageKey = (baseKey) => {
    const userId = getUserId();
    // ถ้ามี userId ให้ใช้ key ที่ผูกกับ user, ถ้าไม่มีให้ใช้ key ธรรมดา สำหรับ Guest/Default
    return userId ? `${baseKey}_${userId}` : baseKey; 
};


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

// Component หลักที่มี Logic และ Hooks ทั้งหมด (ต้องอยู่ภายใน BrowserRouter)
const AppBody = () => {

    //  ใช้ useLocation เพื่อตรวจสอบเส้นทางปัจจุบัน
    const location = useLocation();
    
    // 💡 กำหนดเส้นทางที่ไม่ต้องการให้แสดงปุ่มควบคุม
    const authPaths = ['/signin', '/signup', '/'];
    const shouldShowControls = !authPaths.includes(location.pathname);

    const backgroundKey = getStorageKey('selectedBackground');
    const soundUrlKey = getStorageKey('selectedSoundUrl');
    const volumeKey = getStorageKey('ambientVolume');

    // BACKGROUND STATE & LOGIC
    const defaultBgUrl = defaultBackgroundImage;
    const [currentBackground, setCurrentBackground] = useState(() => {
        return localStorage.getItem(backgroundKey) || defaultBgUrl;
    });
    const [isBgModalOpen, setIsBgModalOpen] = useState(false);

    const handleBackgroundSelect = (bgUrl) => {
        setCurrentBackground(bgUrl);
        localStorage.setItem(backgroundKey, bgUrl);
    };
    
    // SOUND STATE & LOGIC
    // ต้องประกาศตัวแปรนี้ก่อนที่จะนำไปใช้ใน useState ของ currentSoundUrl
    const firstSoundOption = soundOptions && soundOptions.length > 0 ? soundOptions[0] : { url: null, name: null };
    
    // ประกาศ State หลักสำหรับ URL เสียง
    const [currentSoundUrl, setCurrentSoundUrl] = useState(() => {
       return localStorage.getItem(soundUrlKey) || firstSoundOption.url;
    });
    
    // State/Ref อื่นๆ
    const [volume, setVolume] = useState(() => {
        const storedVolume = localStorage.getItem(volumeKey);
        return storedVolume !== null ? parseFloat(storedVolume) : 0.5;
    });
    const [isPlaying, setIsPlaying] = useState(false); 
    const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
    
    const audioRef = useRef(null); 
    
    const handleSoundSelect = (soundOption) => {
        const { url } = soundOption;
        if (currentSoundUrl === url) {
             setIsPlaying(prev => !prev);
        } else {
             setCurrentSoundUrl(url); 
             localStorage.setItem(soundUrlKey, url);
             setIsPlaying(true); 
        }
    };

    const handleVolumeChange = (event) => {
        const newVolume = parseFloat(event.target.value) / 100; 
        setVolume(newVolume);
        localStorage.setItem(volumeKey, newVolume);
    };


    // Effect สำหรับใช้พื้นหลัง
    useEffect(() => {
        document.documentElement.style.backgroundImage = `url(${currentBackground})`;
        document.documentElement.style.backgroundSize = 'cover';
        document.documentElement.style.backgroundPosition = 'center';
        document.documentElement.style.backgroundAttachment = 'fixed';
    }, [currentBackground]);

    // useEffect เพื่อโหลดการตั้งค่าใหม่เมื่อ User ID เปลี่ยน
    useEffect(() => {
        // โหลดค่าเริ่มต้นใหม่เมื่อ Key (ซึ่งผูกกับ User ID) เปลี่ยนไป
        
        const newBackground = localStorage.getItem(backgroundKey) || defaultBgUrl;
        const newSoundUrl = localStorage.getItem(soundUrlKey) || firstSoundOption.url;
        const newVolume = parseFloat(localStorage.getItem(volumeKey) || 0.5);

        // ตั้งค่า State 
        setCurrentBackground(newBackground);
        setCurrentSoundUrl(newSoundUrl);
        setVolume(newVolume);
        setIsPlaying(false); 

        // อัปเดต src ของ audioRef ทันที
        if (audioRef.current) {
            audioRef.current.src = newSoundUrl || '';
            audioRef.current.load();
            audioRef.current.volume = newVolume;
        }
        
    }, [backgroundKey, soundUrlKey, volumeKey, defaultBgUrl, firstSoundOption.url]);

    // useEffects สำหรับควบคุม Audio

    // useEffect สำหรับการโหลดเพลงและตั้งค่า Volume เริ่มต้น จะทำงานเมื่อ currentSoundUrl เปลี่ยนเท่านั้น
    useEffect(() => {
        if (!audioRef.current) {
            // สร้าง Audio Object ครั้งแรก
            audioRef.current = new Audio(currentSoundUrl || ''); 
            audioRef.current.loop = true;
            audioRef.current.volume = volume; // ตั้งค่า Volume เริ่มต้น
        }
        
        // ถ้า URL เปลี่ยน ให้เปลี่ยน src และโหลดใหม่ อาจทำให้เพลงหยุดชั่วคราว/รีเซ็ต
        if (audioRef.current.src !== currentSoundUrl) {
            audioRef.current.src = currentSoundUrl || '';
            audioRef.current.load(); 
        }
        
    }, [currentSoundUrl]); 

    
    // useEffect สำหรับควบคุมการเล่น/หยุด (Play/Pause) จะทำงานเมื่อ isPlaying หรือ currentSoundUrl เปลี่ยน
    useEffect(() => {
        if (audioRef.current) {
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
    }, [isPlaying, currentSoundUrl]); 

    
    // useEffect ใหม่! สำหรับควบคุมระดับเสียง (Volume) โดยเฉพาะ จะทำงานเมื่อ volume เปลี่ยนเท่านั้น และจะไม่เรียก .load() หรือ .play()
    useEffect(() => {
        if (audioRef.current) {
            // ตั้งค่า Volume อย่างเดียว ไม่มีการ load() หรือ play()
            audioRef.current.volume = volume; 
        }
    }, [volume]); // ขึ้นอยู่กับ volume เท่านั้น

    // Cleanup Audio Element
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);


    // RENDER: Controls, Modal และ Routes
    
    const isAnySoundSelected = !!currentSoundUrl;

    // ฟังก์ชันควบคุมการเปิด Modal เพื่อให้ Modal หนึ่งปิดเมื่ออีก Modal ถูกเปิด
    const toggleModal = (modalName) => {
        if (modalName === 'bg') {
            setIsBgModalOpen(prev => !prev);
            setIsSoundModalOpen(false); // ปิด Modal Sound
        } else if (modalName === 'sound') {
            setIsSoundModalOpen(prev => !prev);
            setIsBgModalOpen(false); // ปิด Modal Background
        }
    };
    
    return (
        <div className="App"> 
            
            {/* CONDITIONAL RENDERING: แสดงเฉพาะเมื่อ shouldShowControls เป็น true */}
            {shouldShowControls && (
                <div className="utility-fixed-container">
                    
                    {/* Footer Icons */}
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

                    {/* Modal Controls (แสดงผลเมื่อถูกเปิด) */}
                    
                    {/* Modal Background */}
                    <BackgroundButton
                        isOpen={isBgModalOpen}
                        onToggle={() => setIsBgModalOpen(false)} 
                        onSelectBackground={handleBackgroundSelect}
                        currentBackgroundUrl={currentBackground}
                    />

                    {/* Modal Sound */}
                    <AmbientSoundSelector
                        isOpen={isSoundModalOpen}
                        onToggle={() => setIsSoundModalOpen(false)} 
                        currentSoundUrl={currentSoundUrl}
                        volume={volume}
                        isPlaying={isPlaying} 
                        handleSelect={handleSoundSelect}
                        handleVolumeChange={handleVolumeChange}
                    />
                </div>
            )}

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
    );
};


// Component App หลักที่ Export ออกไป (ห่อด้วย BrowserRouter)
const App = () => {
    // สร้าง Key ที่เปลี่ยนเมื่อมีการล็อกอิน/ล็อกเอาต์
    // ใช้ 'token' เป็นตัวบ่งชี้การล็อกอิน หรือใช้ 'guest' หากยังไม่ได้ล็อกอิน
    const sessionKey = sessionStorage.getItem('token') || 'guest';
    return (
    <BrowserRouter>
        <AppBody key={sessionKey} />
    </BrowserRouter>
    );
};

export default App;