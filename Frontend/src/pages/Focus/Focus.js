import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ ลบ import 'firebase/...' ทั้งหมดออก
import { Music, Image as ImageIcon, BookText, Home, Flame, Settings, Edit2, ChevronUp, ChevronDown } from 'lucide-react';
import './Focus.css';
import backgroundImage from '../../assets/bg.png';
import SettingsButton from '../../components/Button/Setting';
import BackgroundButton from '../../components/Button/SelectBg';

// 🛑 NEW: ฟังก์ชัน Utility สำหรับแปลง 'MM:SS' ใน sessionStorage เป็นนาที
const getDurationInMinutes = (storedTime) => {
    if (storedTime) {
        const [minutes, seconds] = storedTime.split(':').map(Number);
        return minutes + (seconds / 60);
    }
    return 5; // ค่าเริ่มต้น 5 นาที
};


const FocusPage = () => {
    const navigate = useNavigate();
    const [task, setTask] = useState('What do you want to focus on?');
    const [isEditingTask, setIsEditingTask] = useState(false);

    // --- Durations ---
    const [focusDuration, setFocusDuration] = useState(25);

    // 🛑 ดึงค่า Break Time ครั้งแรกจาก sessionStorage
    const [breakDuration, setBreakDuration] = useState(() => {
        const storedBreakTime = sessionStorage.getItem('breakTime');
        return getDurationInMinutes(storedBreakTime);
    });

    // --- Timer States ---
    const [focusTimeLeft, setFocusTimeLeft] = useState(focusDuration * 60);
    const [breakTimeLeft, setBreakTimeLeft] = useState(breakDuration * 60);

    const [isFocusActive, setIsFocusActive] = useState(false);
    const [isBreakActive, setIsBreakActive] = useState(false);
    const inputRef = useRef(null);


    // --- Effects for Timers ---
    // ✅ ข้อ 4 (Prisma): ฟังก์ชันสำหรับบันทึกเซสชันผ่าน API
    const saveFocusSession = useCallback(async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            console.log("No auth token found, can't save session.");
            return;
        }
        if (task.trim() === '' || task === 'What do you want to focus on?') {
            console.log("No task, not saving session.");
            return;
        }

        try {
            const API_ENDPOINT = '/api/v1/focus-sessions';
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    taskName: task,
                    durationMinutes: focusDuration
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            console.log("Focus session saved via API!");

        } catch (error) {
            console.error("Error saving focus session: ", error);
        }

    }, [task, focusDuration]);

    // ✅ ข้อ 2 (แก้บั๊ก): ห่อฟังก์ชันด้วย useCallback เพื่อให้เสถียร (แก้เลขกระพริบ)
    const endBreakAndResumeFocus = useCallback(() => {
        setIsBreakActive(false);
        setIsFocusActive(true);
    }, []);

    // 1. State สำหรับ Background
    const defaultBgUrl = backgroundImage;
    const [currentBackground, setCurrentBackground] = useState(() => {
        return sessionStorage.getItem('selectedBackground') || defaultBgUrl;
    });

    // 2. ฟังก์ชัน Callback สำหรับเปลี่ยนพื้นหลัง
    const handleBackgroundSelect = (bgUrl) => {
        setCurrentBackground(bgUrl);
        sessionStorage.setItem('selectedBackground', bgUrl);
    };

    // ✅ Effect Timer ของ Focus (ปรับปรุงเพื่อลดการกระตุก)
    useEffect(() => {
        if (isFocusActive) {
            const interval = setInterval(() => {
                setFocusTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(interval);
                        setIsFocusActive(false);
                        saveFocusSession();
                        alert("Focus session completed!");

                        // 🛑 ซิงค์ Break Time ล่าสุดจาก Settings และเริ่มพักอัตโนมัติ
                        const latestBreakDuration = getDurationInMinutes(sessionStorage.getItem('breakTime'));
                        setBreakDuration(latestBreakDuration); // อัปเดต State
                        setBreakTimeLeft(latestBreakDuration * 60); // ตั้งค่าเวลาพักใหม่
                        setIsBreakActive(true); // เริ่มพัก
                        
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            // Cleanup
            return () => clearInterval(interval);
        }
    }, [isFocusActive, saveFocusSession]); // Dependency Array ถูกต้อง: ใช้เฉพาะ state ที่จำเป็น

    // ✅ Effect Timer ของ Break (ปรับปรุงเพื่อลดการกระตุก)
    useEffect(() => {
        if (isBreakActive) {
            const interval = setInterval(() => {
                setBreakTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(interval);
                        
                        // 🛑 เมื่อพักจบ (อัปเดต breakDuration state ให้ตรงกับค่าล่าสุดใน Settings)
                        const latestBreakDuration = getDurationInMinutes(sessionStorage.getItem('breakTime'));
                        setBreakDuration(latestBreakDuration);
                        setBreakTimeLeft(latestBreakDuration * 60); 

                        endBreakAndResumeFocus();
                        alert("Break's over!");
                        
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isBreakActive, endBreakAndResumeFocus]); // Dependency Array ถูกต้อง

    // Effect สำหรับอัปเดตเวลาเมื่อผู้ใช้ปรับค่า (ขณะที่นาฬิกาหยุด)
    useEffect(() => {
        if (!isFocusActive && !isBreakActive) {
            setFocusTimeLeft(focusDuration * 60);
            // 🛑 เพิ่ม: อัปเดต Break Time Left ด้วย เพื่อให้แสดงผลถูกต้องทันที
            setBreakTimeLeft(breakDuration * 60); 
        }
    }, [focusDuration, breakDuration, isFocusActive, isBreakActive]); // เพิ่ม breakDuration ใน dependency

    
    useEffect(() => {
        if (isEditingTask) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditingTask]);

    
    // --- Button Handlers ---
    const handleStartFocus = () => {
        if (task.trim() === '' || task === 'What do you want to focus on?') {
        setTask('Focus Session');
    }
        setIsEditingTask(false);
        setIsFocusActive(true);
        setIsBreakActive(false);
    };

    // 🛑 NEW: ดึงค่าล่าสุดจาก sessionStorage ทันทีที่ถูกกด "Break"
    const handleTakeBreak = () => {
        setIsFocusActive(false);

        // 1. ดึงค่า Break Time ล่าสุดจาก sessionStorage
        const latestBreakDuration = getDurationInMinutes(sessionStorage.getItem('breakTime'));

        // 2. อัปเดต State: breakDuration และ breakTimeLeft
        setBreakDuration(latestBreakDuration); 
        setBreakTimeLeft(latestBreakDuration * 60);
        
        // 3. เริ่ม Break
        setIsBreakActive(true);
    };

    const handleSkipBreak = () => {
        // 🛑 NEW: เมื่อ Skip Break (อัปเดต breakDuration state ให้ตรงกับค่าล่าสุดใน Settings)
        const latestBreakDuration = getDurationInMinutes(sessionStorage.getItem('breakTime'));
        setBreakDuration(latestBreakDuration);
        setBreakTimeLeft(latestBreakDuration * 60); 
        
        endBreakAndResumeFocus();
    };
    
    const handleSkipFocus = () => {
        setIsFocusActive(false);
        setFocusTimeLeft(focusDuration * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const changeDuration = (amount) => {
        // อนุญาตให้ปรับ Focus Duration ได้เมื่อ Focus/Break ไม่ Active
        if (isFocusActive || isBreakActive) return; 
        setFocusDuration(prev => Math.max(1, prev + amount));
    };

    const handleTaskSubmit = (e) => {
        e.preventDefault();
        if(task.trim() !== '') setIsEditingTask(false);
    };

    const handleNavClick = (path) => {
        console.log(`Navigating to ${path}`);
        navigate(path);
    };

    // 🛑 FIX: กำหนดให้ตัวเลขใหญ่แสดง focusTimeLeft เสมอ เพื่อให้เห็นเวลาที่หยุดไว้
    const displayedTime = focusTimeLeft;


    return (
        <div className="focus-page-container" style={{ backgroundImage: `url(${currentBackground})` }}>
            {/* Header / Quote */}
            <header className="focus-header">
                <div className="app-branding">
                    <span className="app-name">GetItDone</span>
                    <p className="app-subtitle">by Muk and Cream</p>
                </div>
                <div className="app-quote">
                    <p>"Strive for progress,</p>
                    <p>not perfection"</p>
                </div>
            </header>

            <main className="focus-main-content">
                <p className="session-indicator">
                    {/* แสดงสถานะ Focus หรือ Break */}
                    {isBreakActive ? `Break (${breakDuration} min)` : `Focus (${focusDuration} min)`}
                </p>
               
                {isEditingTask ? (
                    <form onSubmit={handleTaskSubmit} className="task-form">
                        <input
                            ref={inputRef} type="text" value={task}
                            onChange={(e) => setTask(e.target.value)}
                            onBlur={() => setIsEditingTask(false)}
                            className="task-input"
                        />
                    </form>
                ) : (
                    <h2 className="task-display" onClick={() => !isFocusActive && !isBreakActive && setIsEditingTask(true)}>
                        {task} {!isFocusActive && !isBreakActive && <Edit2 size={20} className="edit-icon" />}
                    </h2>
                )}

                <div className="timer-display">
                    <div className="time-adjust-left">
                        {/* ปุ่มปรับเวลายังคงใช้เงื่อนไขเดิม */}
                        <button onClick={() => changeDuration(1)} className="time-adjust-button" disabled={isFocusActive || isBreakActive}><ChevronUp size={48} /></button>
                    </div>
                    {/* 🛑 FIX: ตัวเลขใหญ่แสดงเวลา Focus ที่ถูกหยุดไว้ */}
                    <span className="timer-digits">{formatTime(displayedTime)}</span> 
                    <div className="time-adjust-right">
                        {/* ปุ่มปรับเวลายังคงใช้เงื่อนไขเดิม */}
                        <button onClick={() => changeDuration(-1)} className="time-adjust-button" disabled={isFocusActive || isBreakActive}><ChevronDown size={48} /></button>
                    </div>
                </div>



                {isBreakActive && (
                    <div className="break-timer-wrapper">
                        <div className="break-timer-line"></div>
                        <div className="break-timer-content">
                            {/* 🛑 ตัวเลขเล็กด้านล่างแสดงเวลาพักที่กำลังนับถอยหลัง */}
                            <span>{formatTime(breakTimeLeft)}</span>
                            <button onClick={handleSkipBreak} className="skip-break-button">Skip</button>
                        </div>
                    </div>
                )}



                <div className="action-buttons">
                    {!isFocusActive && !isBreakActive && (
                        <button onClick={handleStartFocus} className="control-button start-button">Start</button>
                    )}
                    {isFocusActive && (
                        <>
                            <button onClick={handleTakeBreak} className="control-button break-button">Break</button>
                            <button onClick={handleSkipFocus} className="control-button skip-button">Skip</button>
                        </>
                    )}
                </div>
            </main>
           
            {/* Footer */}
           <footer className="focus-footer">
               
                {/* Left Side Icons */}
                <div className="footer-icons">
                    <button className="footer-icon-button" title="Music" onClick={() => handleNavClick('/music')}><Music size={24} color="#FFF" /></button>
                   
                    <BackgroundButton
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


export default FocusPage;