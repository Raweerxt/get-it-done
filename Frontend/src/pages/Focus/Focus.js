import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Image as ImageIcon, BookText, Home, Flame, Settings, Edit2, ChevronUp, ChevronDown } from 'lucide-react';
import './Focus.css';
import backgroundImage from '../../assets/bg.png';

const FocusPage = () => {
    const navigate = useNavigate();
    const [task, setTask] = useState('What do you want to focus on?');
    const [isEditingTask, setIsEditingTask] = useState(false);

    // --- Durations ---
    const [focusDuration, setFocusDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);

    // --- Timer States ---
    const [focusTimeLeft, setFocusTimeLeft] = useState(focusDuration * 60);
    const [breakTimeLeft, setBreakTimeLeft] = useState(breakDuration * 60);

    const [isFocusActive, setIsFocusActive] = useState(false); // นาฬิกา Focus กำลังเดินหรือไม่
    const [isBreakActive, setIsBreakActive] = useState(false); // นาฬิกา Break กำลังเดินหรือไม่

    const inputRef = useRef(null);

    // --- Effects for Timers ---

    // Effect สำหรับนาฬิกา Focus หลัก
    useEffect(() => {
        let interval = null;
        if (isFocusActive && focusTimeLeft > 0) {
            interval = setInterval(() => setFocusTimeLeft(prev => prev - 1), 1000);
        } else if (isFocusActive && focusTimeLeft === 0) {
            setIsFocusActive(false);
            alert("Focus session completed! Time for a real break.");
        }
        return () => clearInterval(interval);
    }, [isFocusActive, focusTimeLeft]);

    // Effect สำหรับนาฬิกา Break (ที่คั่นเวลา)
    useEffect(() => {
        let interval = null;
        if (isBreakActive && breakTimeLeft > 0) {
            interval = setInterval(() => setBreakTimeLeft(prev => prev - 1), 1000);
        } else if (isBreakActive && breakTimeLeft === 0) {
            alert("Break's over! Let's get back to it.");
            endBreakAndResumeFocus(); // กลับไปทำงาน Focus ต่ออัตโนมัติ
        }
        return () => clearInterval(interval);
    }, [isBreakActive, breakTimeLeft]);

    // Effect สำหรับอัปเดตเวลาเมื่อผู้ใช้ปรับค่า (ขณะที่นาฬิกาหยุด)
    useEffect(() => {
        if (!isFocusActive && !isBreakActive) {
            setFocusTimeLeft(focusDuration * 60);
        }
    }, [focusDuration, isFocusActive, isBreakActive]);
    
    useEffect(() => {
        if (isEditingTask) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditingTask]);
    
    // --- Button Handlers ---

    const handleStartFocus = () => {
        if (task.trim() === '' || task === 'What do you want to focus on?') {
            alert("Please enter a task before starting.");
            setIsEditingTask(true);
            return;
        }
        setIsEditingTask(false);
        setIsFocusActive(true);
    };

    // ✅ LOGIC ใหม่: กด Break เพื่อหยุด Focus ชั่วคราว
    const handleTakeBreak = () => {
        setIsFocusActive(false); // หยุดเวลา Focus
        setBreakTimeLeft(breakDuration * 60); // รีเซ็ตเวลา Break
        setIsBreakActive(true); // เริ่มนับเวลา Break
    };
    
    // ฟังก์ชันสำหรับจบการ Break และกลับไป Focus ต่อ
    const endBreakAndResumeFocus = () => {
        setIsBreakActive(false);
        setIsFocusActive(true); // กลับไปนับเวลา Focus ต่อจากเดิม
    };

    // ✅ LOGIC ใหม่: กด Skip เพื่อข้ามเวลา Break
    const handleSkipBreak = () => {
        endBreakAndResumeFocus();
    };
    
    // ✅ LOGIC ใหม่: กด Skip เพื่อรีเซ็ตเวลา Focus
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
        if (isFocusActive || isBreakActive) return;
        setFocusDuration(prev => Math.max(1, prev + amount));
    };

    const handleTaskSubmit = (e) => {
        e.preventDefault();
        if(task.trim() !== '') setIsEditingTask(false);
    };

    const currentBackground = sessionStorage.getItem('selectedBackground') || backgroundImage;

    return (
        <div className="focus-page-container" style={{ backgroundImage: `url(${currentBackground})` }}>
            <header className="focus-header">
                <div className="app-branding"><span className="app-name">GetItDone</span></div>
                <div className="app-quote"><p>"Strive for progress, not perfection"</p></div>
            </header>

            <main className="focus-main-content">
                <p className="session-indicator">
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
                        <button onClick={() => changeDuration(1)} className="time-adjust-button" disabled={isFocusActive || isBreakActive}><ChevronUp size={48} /></button>
                    </div>
                    <span className="timer-digits">{formatTime(focusTimeLeft)}</span>
                    <div className="time-adjust-right">
                        <button onClick={() => changeDuration(-1)} className="time-adjust-button" disabled={isFocusActive || isBreakActive}><ChevronDown size={48} /></button>
                    </div>
                </div>

                {/* ✅ UI ใหม่: แสดงเวลาเบรกด้านล่าง */}
                {isBreakActive && (
                    <div className="break-timer-wrapper">
                        <div className="break-timer-line"></div>
                        <div className="break-timer-content">
                            <span>{formatTime(breakTimeLeft)}</span>
                            <button onClick={handleSkipBreak} className="skip-break-button">Skip</button>
                        </div>
                    </div>
                )}

                {/* ✅ UI ใหม่: แสดงปุ่มตามสถานะ */}
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
            
            <footer className="focus-footer">
                <div className="footer-icons">
                    <button className="footer-icon-button" title="Music"><Music size={24} color="#FFF" /></button>
                    <button className="footer-icon-button" title="Background"><ImageIcon size={24} color="#FFF" /></button>
                </div>
                <div className="footer-icons">
                    <button className="footer-icon-button" title="Focus" onClick={() => navigate('/focus')}><BookText size={24} color="#FFF" /></button>
                    <button className="footer-icon-button" title="Home" onClick={() => navigate('/home')}><Home size={24} color="#FFF" /></button>
                    <button className="footer-icon-button" title="Streak"><Flame size={24} color="#FFF" /></button>
                    <button className="footer-icon-button" title="Settings"><Settings size={24} color="#FFF" /></button>
                </div>
            </footer>
        </div>
    );
};

export default FocusPage;