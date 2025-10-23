// fileName: SelectBg.js
import React from 'react';
import './SelectBg.css'; 
// 🛑 นำเข้าไอคอนสำหรับปุ่มหลัก
import { Image, X } from 'lucide-react'; 

//  1. Import รูปภาพพื้นหลังที่ต้องการทั้งหมดจาก src/assets/background/
import DefaultBg from '../../assets/bg.png'; 
import AfterRainBg from '../../assets/background/AfterRain.png';
import CloudBg from '../../assets/background/Cloud.png';
import DamBg from '../../assets/background/Dam.png';
import DarkCoastBg from '../../assets/background/DarkCoast.png';
import EarthBg from '../../assets/background/Earth.png';
import FallBg from '../../assets/background/Fall.png';
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

//  2. ปรับปรุง backgroundOptions ให้ใช้ตัวแปรที่ Import เข้ามา
const backgroundOptions = [
    { name: 'Default', url: DefaultBg }, 
    { name: 'After Rain', url: AfterRainBg },    
    { name: 'Cloud', url: CloudBg },      
    { name: 'Dam', url: DamBg },
    { name: 'Dark Coast', url: DarkCoastBg },
    { name: 'Earth', url: EarthBg },
    { name: 'Fall', url: FallBg },
    { name: 'Grass', url: GrassBg },
    { name: 'Hill', url: HillBg },
    { name: 'Lake', url: LakeBg },
    { name: 'Mountain', url: MountainBg },
    { name: 'Nasa', url: NasaBg },
    { name: 'Pastel', url: PastelBg },
    { name: 'Rain', url: RainBg },
    { name: 'Road', url: Road },
    { name: 'Sea', url: SeaBg },
    { name: 'Sky', url: SkyBg },
    { name: 'Snow Road', url: SnowRoadBg },
    { name: 'Starry Night', url: StarryNightBg },
];

const BackgroundButton = ({ onSelectBackground }) => { 
    // State สำหรับควบคุมการแสดง/ซ่อน Modal (Pop-up)
    const [isOpen, setIsOpen] = React.useState(false); 
    
    // ฟังก์ชันสลับการแสดงผล Modal
    const toggleModal = () => {
        setIsOpen(!isOpen);
    };
    
    // ฟังก์ชันสำหรับจัดการการเลือกพื้นหลัง
    const handleSelect = (url) => {
        onSelectBackground(url);
        setIsOpen(false); // ปิด Modal หลังเลือก
    };

    return (
        <React.Fragment>
            {/* 1. ปุ่มหลัก (ปุ่มไอคอน) - ใช้คลาสเดียวกับ Settings */}
            <button 
                className="footer-icon-button" 
                onClick={toggleModal}
                aria-label="Select Background"
                title="Change Background"
            >
                {/* 🛑 ใช้ Icon รูปภาพ */}
                <Image size={24} color="#FFF" /> 
            </button>

            {/* 2. Modal/Pop-up สำหรับ Background Selector */}
            {isOpen && (
                // 🛑 ใช้ Wrapper สำหรับจัดตำแหน่งซ้ายล่าง
                <div className="bg-selector-modal-wrapper">
                    <div className="bg-selector-modal">
                        {/* ปุ่มปิด Modal */}
                        <button className="close-button" onClick={toggleModal} aria-label="Close">
                            {/* 🛑 ใช้ Icon X */}
                            <X size={20} color="#333" />
                        </button>
                        
                        <h4 className="modal-title">Select Background</h4> 
                        
                        <div className="background-grid">
                            {backgroundOptions.map((bg) => (
                                <div 
                                    key={bg.name}
                                    className="background-option" 
                                    onClick={() => handleSelect(bg.url)}
                                    style={{ backgroundImage: `url(${bg.url})` }}
                                    title={`Select ${bg.name}`}
                                >
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