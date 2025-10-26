// fileName: Sounds.js (Corrected and Updated)

import React from 'react'; 
import './Sounds.css';
// 🛑 นำเข้า Icon สำหรับ Play/Pause เพิ่มเติม
import { X, Volume2, VolumeX, Play, Pause } from 'lucide-react';

// 🛑 Import ไฟล์เสียงทั้งหมด (ตรวจสอบพาธ: ../../assets/sound/)
import CafeSound from '../../assets/sound/Cafe.mp3';
import ForestSound from '../../assets/sound/EnchantedForest.mp3'; 
import FireSound from '../../assets/sound/Fireplace.mp3';
import OceanSound from '../../assets/sound/Ocean.mp3';
import RainSound from '../../assets/sound/Rain.mp3';
import RiverSound from '../../assets/sound/River.mp3'; 

// ข้อมูลเสียงบรรยากาศ - ต้อง Export ให้ App.js เข้าถึงได้
export const soundOptions = [
    { name: 'Rain', url: RainSound, icon: '🌧️' },
    { name: 'Ocean', url: OceanSound, icon: '🌊' },
    { name: 'Forest', url: ForestSound, icon: '🌲' },
    { name: 'Fire', url: FireSound, icon: '🔥' },
    { name: 'River', url: RiverSound, icon: '🚣🏻‍♀️' }, 
    { name: 'Café', url: CafeSound, icon: '☕' },
];

// 💡 AmbientSoundSelector รับ Props ควบคุมทั้งหมดจาก App.js
const AmbientSoundSelector = ({ 
    isOpen, 
    onToggle, 
    currentSoundUrl, 
    volume,    
    // 🛑 เพิ่ม isPlaying prop เข้ามา
    isPlaying,      
    handleSelect,    
    handleVolumeChange 
}) => {
    
    // 💡 Logic สำหรับการกด Play/Pause ที่ไม่ใช่การเลือกเสียงใหม่
    const togglePlayPause = () => {
        const currentSoundOption = soundOptions.find(s => s.url === currentSoundUrl);
        // ถ้ามีเสียงปัจจุบัน ให้ใช้ handleSelect เพื่อสลับสถานะ Play/Pause ใน App.js
        if (currentSoundOption) {
            handleSelect(currentSoundOption);
        }
    };

    const isAnySoundSelected = currentSoundUrl !== null && currentSoundUrl !== '';

    return (
        <React.Fragment>
            
            {isOpen && (
                <div className="sound-selector-modal-wrapper-fixed"> {/* 🛑 ใช้คลาสตาม Sounds.css */}
                    <div className="sound-selector-modal"> {/* 🛑 ใช้คลาสตาม Sounds.css */}
                        
                        {/* Header/Title */}
                        <div className="modal-header">
                            <h3>Ambient Sounds</h3>
                            <button className="close-button" onClick={onToggle} title="Close">
                                <X size={20} color="#333" />
                            </button>
                        </div>
                        
                        {/* 🛑 ปุ่มควบคุม Play/Pause (เพิ่มมาเพื่อ UX) */}
                        <div className="sound-controls">
                            <button 
                                className="play-pause-button" 
                                onClick={togglePlayPause} 
                                title={isPlaying ? 'Pause Sound' : 'Play Sound'}
                                disabled={!isAnySoundSelected}
                            >
                                {isPlaying ? <Pause size={32} color="#333" /> : <Play size={32} color="#333" />}
                            </button>
                            <span className="control-label">
                                {isPlaying && isAnySoundSelected ? 'Playing' : 'Paused'}
                                {!isAnySoundSelected && ' (Select a sound)'}
                            </span>
                        </div>

                        {/* Sound Grid */}
                        <div className="sound-grid"> {/* 🛑 ใช้คลาสตาม Sounds.css */}
                            {soundOptions.map((sound) => (
                                <div 
                                    key={sound.name}
                                    className={`sound-option ${currentSoundUrl === sound.url ? 'active' : ''}`}
                                    onClick={() => handleSelect(sound)}
                                    title={currentSoundUrl === sound.url && isPlaying ? `Pause ${sound.name}` : `Play ${sound.name}`}
                                >
                                    <span className="sound-icon" role="img" aria-label={sound.name}>
                                        {sound.icon}
                                    </span>
                                    <span className="sound-name">{sound.name}</span>
                                </div>
                            ))}
                        </div>
                        
                        {/* Volume Control */}
                        <div className="volume-control"> {/* 🛑 ใช้คลาสตาม Sounds.css */}
                            <VolumeX size={20} color="#333" />
                            
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={volume * 100} 
                                className="volume-slider" 
                                onChange={handleVolumeChange} 
                                aria-label="Volume"
                                disabled={!isAnySoundSelected}
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