import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, X } from 'lucide-react'; 
import './Setting.css'; 

// ฟังก์ชันสำหรับจัดการการออกจากระบบ (ย้ายมาจาก HomePage)
const handleLogout = (navigate) => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
    
    // ใช้ navigate เพื่อเปลี่ยนเส้นทางไปยังหน้า Sign-in
    navigate('/signin'); 
};

const SettingsButton = () => {
    const navigate = useNavigate();
    // State สำหรับควบคุมการแสดง/ซ่อน Modal (Pop-up)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    // State สำหรับค่าการตั้งเวลา Break 
    const [breakTime, setBreakTime] = useState(sessionStorage.getItem('breakTime') || '05:00'); 

    // ฟังก์ชันสลับการแสดงผล Modal
    const toggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
    };

    const handleTimeChange = (e) => {
        const value = e.target.value.replace(/[^0-9:]/g, ''); 
        setBreakTime(value);
        // 🛑 บันทึกค่าใหม่ลง sessionStorage ทันที
        sessionStorage.setItem('breakTime', value);
    };

    return (
        // ✅ เปลี่ยนจาก div ที่มีการจัดวางเป็นปุ่มธรรมดา (เพื่อให้รวมกับ Footer ได้)
        <React.Fragment>
            {/* 1. ปุ่ม Settings หลัก (ปุ่มเฟืองที่อยู่ข้างปุ่ม Home) */}
            <button 
                // 🛑 ใช้คลาสเดิมเพื่อให้ได้สไตล์ปุ่มไอคอนที่สวยงาม
                className="footer-icon-button" 
                onClick={toggleSettings}
                aria-label="Open Settings"
                title="Settings"
            >
                {/* 🛑 การใช้ Icon ที่ถูกต้อง */}
                <Settings size={24} color="#FFF" /> 
            </button>

            {/* 2. Modal/Pop-up สำหรับ Settings (แสดงเมื่อ isSettingsOpen เป็น true) */}
            {isSettingsOpen && (
                <div className="settings-modal-wrapper">
                    <div className="settings-modal">
                        {/* ปุ่มปิด Modal */}
                        <button className="close-button" onClick={toggleSettings}>
                            {/* 🛑 การใช้ Icon ที่ถูกต้อง */}
                            <X size={20} />
                        </button>
                        
                        <h4 className="modal-title">Timer Lengths</h4>

                        <div className="setting-item">
                            <label htmlFor="break-time">Break</label>
                            <div className="input-group">
                                <input
                                    id="break-time"
                                    type="text"
                                    value={breakTime}
                                    onChange={handleTimeChange}
                                    maxLength="5"
                                    placeholder="MM:SS"
                                    className="time-input"
                                />
                                <span>mins</span>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                className="logout-button" 
                                onClick={() => handleLogout(navigate)} // เรียกใช้ฟังก์ชัน Logout
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

export default SettingsButton;