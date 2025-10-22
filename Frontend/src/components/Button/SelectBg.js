// fileName: SelectBg.js
import React from 'react';
import './SelectBg.css'; 
// 🛑 นำเข้าไอคอนสำหรับปุ่มหลัก
import { Image, X } from 'lucide-react'; 

// 🛑 สมมติว่าไฟล์รูปภาพพื้นหลังของคุณจะอยู่ใน public/assets/backgrounds/
const backgroundOptions = [
    { name: 'Default', url: '../assets/bg.png' }, 
    { name: 'Forest', url: '/assets/backgrounds/forest-bg.jpg' },    
    { name: 'Space', url: '/assets/backgrounds/space-bg.jpg' },      
    { name: 'City', url: '/assets/backgrounds/city-bg.jpg' },
    { name: 'Abstract', url: '/assets/backgrounds/abstract-bg.jpg' },
    // ... เพิ่มรูปอื่นๆ ตามต้องการ
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