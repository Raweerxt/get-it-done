// fileName: SelectBg.js (Corrected and Updated)

import React from 'react';
import './SelectBg.css'; 
import { Image, X, Check } from 'lucide-react'; 

// 1. Import รูปภาพพื้นหลังที่ต้องการทั้งหมดจาก src/assets/background/
import DefaultBg from '../../assets/bg.png'; 
import AfterRainBg from '../../assets/background/AfterRain.png';
import CloudBg from '../../assets/background/Cloud.png';
import DamBg from '../../assets/background/Dam.png';
import DarkCoastBg from '../../assets/background/DarkCoast.png';
import EarthBg from '../../assets/background/Earth.png';
import GrassBg from '../../assets/background/Grass.png';
import HillBg from '../../assets/background/Hill.png';
import LakeBg from '../../assets/background/Lake.png';
import MountainBg from '../../assets/background/Mountain.png';
import NasaBg from '../../assets/background/Nasa.png';
import PastelBg from '../../assets/background/Pastel.png';
import RainBg from '../../assets/background/Rain.png';
import Road from '../../assets/background/Road.png';
import SeaBg from '../../assets/background/Sea.png';
import SkyBg from '../../assets/background/Sky.png';
import SnowRoadBg from '../../assets/background/SnowRoad.png';
import StarryNightBg from '../../assets/background/StarryNight.png';


// 💡 Placeholder URL (ใช้สำหรับ Fallback)
const PLACEHOLDER_URL = (name) => `data:image/svg+xml;charset=UTF-8,%3Csvg width='200' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='200' height='150' fill='%23ccc'/%3E%3Ctext x='100' y='75' font-size='12' text-anchor='middle' alignment-baseline='middle' fill='%23666'%3E${name}%3C/text%3E%3C/svg%3E`;

// 2. ข้อมูลพื้นหลัง
export const backgroundOptions = [
    { name: 'Default', url: DefaultBg },
    { name: 'After Rain', url: AfterRainBg },
    { name: 'Cloud', url: CloudBg },
    { name: 'Dam', url: DamBg },
    { name: 'Dark Coast', url: DarkCoastBg },
    { name: 'Earth', url: EarthBg },
    { name: 'Grass Field', url: GrassBg },
    { name: 'Hill Path', url: HillBg },
    { name: 'Lake', url: LakeBg },
    { name: 'Mountain', url: MountainBg },
    { name: 'Nasa', url: NasaBg },
    { name: 'Pastel', url: PastelBg },
    { name: 'Rainy Day', url: RainBg },
    { name: 'Road', url: Road },
    { name: 'Sea', url: SeaBg },
    { name: 'Sky', url: SkyBg },
    { name: 'Snow Road', url: SnowRoadBg },
    { name: 'Starry Night', url: StarryNightBg },
];

// 🛑 Component รับ Props: isOpen, onToggle, onSelectBackground, currentBackgroundUrl
const BackgroundButton = ({ isOpen, onToggle, onSelectBackground, currentBackgroundUrl }) => {

    const handleSelect = (bgUrl) => {
        onSelectBackground(bgUrl); // ส่ง URL กลับไป App.js
        // 🛑 ตามความต้องการ: ไม่มีการเรียก onToggle() ที่นี่ เพื่อไม่ให้ Modal ปิดอัตโนมัติ
    };

    return (
        <React.Fragment>
            {/* Modal/Pop-up: แสดงผลตาม Props isOpen */}
            {isOpen && ( 
                <div className="bg-selector-modal-wrapper"> 
                    <div className="bg-selector-modal"> {/* 🛑 ใช้คลาสตาม SelectBg.css */}
                        
                         {/* ปุ่มปิด Modal */}
                        <button className="close-button" onClick={onToggle} aria-label="Close">
                            <X size={20} color="#333" />
                        </button>
                        
                        <h4 className="modal-title">Select Background</h4> 
                        
                        <div className="background-grid"> {/* 🛑 ใช้คลาสตาม SelectBg.css */}
                            {backgroundOptions.map((bg) => (
                                <div 
                                    key={bg.name}
                                    className={`background-option ${currentBackgroundUrl === bg.url ? 'active' : ''}`}
                                    onClick={() => handleSelect(bg.url)}
                                    title={`Select ${bg.name}`}
                                >
                                    <div className="bg-preview-container">
                                        <img 
                                            src={bg.url} 
                                            alt={bg.name} 
                                            className="bg-preview-img"
                                            onError={(e) => { 
                                                e.target.src = PLACEHOLDER_URL(bg.name); 
                                                e.target.style.objectFit = 'contain'; 
                                            }}
                                        />
                                         {currentBackgroundUrl === bg.url && (
                                            <div className="selection-indicator">
                                                <Check size={20} color="#FFF" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="background-name">{bg.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

export default BackgroundButton;