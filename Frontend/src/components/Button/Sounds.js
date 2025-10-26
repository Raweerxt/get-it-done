// fileName: Sounds.js
import React, { useState, useEffect, useRef } from 'react';
import './Sounds.css';
// นำเข้า Icon สำหรับปุ่มปิด (X) และควบคุมเสียง (Volume2, VolumeX)
import { X, Volume2, VolumeX } from 'lucide-react'; 

// 🛑 Import ไฟล์เสียงทั้งหมด (ตรวจสอบพาธ: ../../assets/sound/)
import CafeSound from '../../assets/sound/Cafe.mp3';
import ForestSound from '../../assets/sound/EnchantedForest.mp3'; 
import FireSound from '../../assets/sound/Fireplace.mp3';
import OceanSound from '../../assets/sound/Ocean.mp3';
import RainSound from '../../assets/sound/Rain.mp3';
import RiverSound from '../../assets/sound/River.mp3'; 

// ข้อมูลเสียงบรรยากาศ
const soundOptions = [
    { name: 'Rain', url: RainSound, icon: '🌧️' },
    { name: 'Ocean', url: OceanSound, icon: '🌊' },
    { name: 'Forest', url: ForestSound, icon: '🌲' },
    { name: 'Fire', url: FireSound, icon: '🔥' },
    { name: 'River', url: RiverSound, icon: '🚣🏻‍♀️' }, 
    { name: 'Café', url: CafeSound, icon: '☕' },
];

const AmbientSoundSelector = ({ isOpen, onToggle }) => {
    const [currentSoundUrl, setCurrentSoundUrl] = useState(null); 
    // State สำหรับเก็บระดับเสียง (0.0 ถึง 1.0) เริ่มต้นที่ 50%
    const [volume, setVolume] = useState(0.5); 
    // useRef สำหรับอ้างอิงถึง Audio Element
    const audioRef = useRef(new Audio()); 
    
    // ฟังก์ชันสำหรับจัดการการเลือก/เล่นเสียง
    const handleSelect = (soundOption) => {
        const newUrl = soundOption.url;
        const audio = audioRef.current;

        if (currentSoundUrl === newUrl) {
            // ถ้ากดซ้ำ: หยุดเล่นและยกเลิกการเลือก
            audio.pause();
            audio.currentTime = 0; 
            setCurrentSoundUrl(null);
        } else {
            // ถ้าเลือกเสียงใหม่:
            audio.src = newUrl;
            audio.loop = true; 
            audio.volume = volume; // ใช้ระดับเสียงปัจจุบัน
            
            // เริ่มเล่นเสียง
            audio.play().catch(error => {
                console.error("Audio playback error (Autoplay prevented):", error);
            }); 
            setCurrentSoundUrl(newUrl);
        }
    };
    
    // Effect 1: Cleanup เมื่อ Component ถูก Unmount (หยุดเสียง)
    useEffect(() => {
        const audio = audioRef.current;
        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []); 

    // Effect 2: อัปเดตระดับเสียงของ Audio Element เมื่อ Volume State เปลี่ยน
    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);
    
    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงของ Slider
    const handleVolumeChange = (e) => {
        // e.target.value เป็น 0-100, แปลงเป็น 0.0-1.0
        const newVolume = parseFloat(e.target.value) / 100;
        setVolume(newVolume);
    };


    return (
        <React.Fragment>
            {/* 1. ปุ่มหลัก: ใช้ onToggle แทน toggleModal */}
            <button 
                className="footer-icon-button" 
                onClick={onToggle} // 🛑 เมื่อคลิก จะเรียก onToggle ที่ส่งมาจาก Home.js
                aria-label="Select Ambient Sound"
                title="Change Ambient Sound"
            >
                <Volume2 size={24} color={currentSoundUrl ? 'lime' : '#FFF'} /> 
            </button>

            {/* 2. Modal สำหรับ Ambient Sound Selector */}
            {isOpen && ( // 🛑 ใช้ Props isOpen ในการแสดงผล
                <div className="sound-selector-modal-wrapper"> 
                    <div className="sound-selector-modal">
                        
                        {/* ปุ่มปิด Modal: ใช้ onToggle แทน toggleModal */}
                        <button className="close-button" onClick={onToggle} aria-label="Close">
                            <X size={20} color="#333" />
                        </button>
                        
                        <h4 className="modal-title">Ambient Sounds</h4> 
                        
                        <div className="sound-grid">
                            {soundOptions.map((sound) => ( 
                                <div 
                                    key={sound.name}
                                    className={`sound-option ${currentSoundUrl === sound.url ? 'active' : ''}`} 
                                    onClick={() => handleSelect(sound)}
                                    title={`Play ${sound.name}`}
                                >
                                    <span className="sound-icon" role="img" aria-label={sound.name}>
                                        {sound.icon}
                                    </span>
                                    <span className="sound-name">{sound.name}</span>
                                </div>
                            ))}
                        </div>
                        
                        {/* 🛑 Volume Control อยู่ด้านล่างสุด */}
                        <div className="volume-control">
                            <VolumeX size={20} color="#333" />
                            
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={volume * 100} 
                                className="volume-slider" 
                                onChange={handleVolumeChange} 
                                aria-label="Volume"
                            />
                            
                            <Volume2 size={20} color="#333" />
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

export default AmbientSoundSelector;