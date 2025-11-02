import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookText, Home, Flame, Edit2 } from 'lucide-react'; 
import './Focus.css';
import SettingsButton from '../../components/Button/Setting';

// ฟังก์ชัน Utility สำหรับแปลง 'MM:SS' ใน sessionStorage เป็นนาที
const getDurationInMinutes = (storedTime) => {
    if (storedTime) {
        const [minutes, seconds] = storedTime.split(':').map(Number);
        return minutes + (seconds / 60);
    }
    return 5; 
};

// ฟังก์ชัน Utility สำหรับคำนวณ Focus Time Left เริ่มต้นเป็นวินาที
const calculateTotalSeconds = (hours, minutes, seconds) => {
    return (hours * 3600) + (minutes * 60) + seconds;
}

// ฟังก์ชัน Utility สำหรับจัดรูปแบบ HH:MM:SS
const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return {
        hrs: String(hrs).padStart(2, '0'),
        mins: String(mins).padStart(2, '0'),
        secs: String(secs).padStart(2, '0')
    };
};

// ฟังก์ชัน Utility สำหรับจัดรูปแบบ Session Indicator
const formatSessionDuration = (totalMinutes) => {
    if (totalMinutes < 1) return '0 min';
    
    const hrs = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60); 
    
    if (hrs > 0 && mins > 0) {
        return `${hrs} hr ${mins} min`;
    } else if (hrs > 0) {
        return `${hrs} hr`;
    } else {
        return `${mins} min`;
    }
};


const FocusPage = () => {
    const navigate = useNavigate();
    const [task, setTask] = useState('What do you want to focus on?');
    const [isEditingTask, setIsEditingTask] = useState(false);
    
    const [inputHours, setInputHours] = useState(0); 
    const [inputMinutes, setInputMinutes] = useState(25);
    const [inputSeconds, setInputSeconds] = useState(0); 
    
    const [isTimeEditing, setIsTimeEditing] = useState(false);

    // Durations
    const [breakDuration, setBreakDuration] = useState(() => {
        const storedBreakTime = sessionStorage.getItem('breakTime');
        return getDurationInMinutes(storedBreakTime);
    });

    // Timer States
    const initialFocusTime = calculateTotalSeconds(inputHours, inputMinutes, inputSeconds);
    const [focusTimeLeft, setFocusTimeLeft] = useState(initialFocusTime);
    const [breakTimeLeft, setBreakTimeLeft] = useState(breakDuration * 60);

    const [isFocusActive, setIsFocusActive] = useState(false);
    const [isBreakActive, setIsBreakActive] = useState(false);

    const actualFocusSecondsRef = useRef(0);
    const hasSessionCompletedRef = useRef(false);
    const hasBreakCompletedRef = useRef(false);
    
    // Refs สำหรับ Inputs
    const taskInputRef = useRef(null); 
    const hrsInputRef = useRef(null); 
    const minsInputRef = useRef(null);
    const secsInputRef = useRef(null);
    const timeWrapperRef = useRef(null); 


    const saveActualFocus = useCallback(async (focusedSeconds) => {
        const token = sessionStorage.getItem('token');
        
        // ไม่ต้องบันทึกถ้าโฟกัส 0 วินาที
        if (!token || focusedSeconds === 0) { return; }

        // ถ้าผู้ใช้ไม่ได้ตั้งชื่อ task ให้ใช้ชื่อ default
        const sessionTask = (task.trim() === '' || task === 'What do you want to focus on?') 
                            ? 'Focus Session' 
                            : task;

        try {
            const API_ENDPOINT = '/api/v1/focus-sessions';
            
            // คำนวณนาทีจาก "วินาทีที่โฟกัสจริง"
            const totalDurationMinutes = focusedSeconds / 60; 

            await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    taskName: sessionTask,
                    durationMinutes: totalDurationMinutes 
                })
            });
        } catch (error) {
            console.error("Error saving focus session: ", error);
        }
    }, [task]); 


    // ฟังก์ชันที่ใช้ในการเริ่ม Focus ต่อจาก Break หรือ Skip Break
    const startNextFocusSession = useCallback(() => {
        // ตรวจสอบและตั้งค่า Break Duration ล่าสุด
        const latestBreakDuration = getDurationInMinutes(sessionStorage.getItem('breakTime'));
        setBreakDuration(latestBreakDuration);
        setBreakTimeLeft(latestBreakDuration * 60); 

        actualFocusSecondsRef.current = 0;
        hasSessionCompletedRef.current = false; 

        // หยุด Break และเริ่ม Focus
        setIsBreakActive(false);
        setIsFocusActive(true); 
    }, []); 


// Focus Timer Effect (Focus -> Break)
    useEffect(() => {
        let interval;
        if (isFocusActive) {
            interval = setInterval(() => {
                
                // เพิ่มวินาทีที่โฟกัสจริงใน Ref
                actualFocusSecondsRef.current += 1;

                setFocusTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(interval);

                        if (hasSessionCompletedRef.current) {
                            return 0; // ถ้าเคยจบไปแล้ว ก็ไม่ต้องทำซ้ำ
                        }
                        hasSessionCompletedRef.current = true; // Mark as completed

                        // Save session (บันทึกเวลาจริงจาก Ref)
                        saveActualFocus(actualFocusSecondsRef.current);
                        actualFocusSecondsRef.current = 0; // รีเซ็ต Ref
                        
                        // Alert
                        alert("Focus session completed!");
                        setIsFocusActive(false); 

                        return 0; 
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    // อัปเดต Dependencies
    }, [isFocusActive, saveActualFocus]);


    // Break Timer Effect (Break -> Focus ต่อ)
    useEffect(() => {
        let interval;
        if (isBreakActive && !hasBreakCompletedRef.current) {
            interval = setInterval(() => {
                setBreakTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(interval);

                        //  ตรวจสอบ Ref เพื่อป้องกันการทำงานซ้ำใน Strict Mode
                        if (hasBreakCompletedRef.current) {
                            return 0;
                        }
                        hasBreakCompletedRef.current = true; // Mark as completed
                        
                        // Alert (แจ้ง Break หมด)
                        alert("Break's over!");
                        
                        // เริ่ม Focus ต่อโดยอัตโนมัติ ต้องรีเซ็ต focusTimeLeft กลับไปค่าเริ่มต้นก่อนที่จะเริ่ม
                        startNextFocusSession(); 
                        
                        // Focus Time Left จะถูกรีเซ็ตใน startNextFocusSession
                        return 0; 
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isBreakActive, startNextFocusSession]); 


    // Effect สำหรับอัปเดต Focus Time Left เมื่อ H/M/S ถูกแก้ไข (ขณะที่นาฬิกาหยุด)
    useEffect(() => {
        // อัปเดต FocusTimeLeft และ BreakTimeLeft เฉพาะเมื่ออยู่ในสถานะ Idle เท่านั้น (เพื่อให้การตั้งค่าเวลาใช้งานได้เมื่อไม่ได้กำลังจับเวลาอยู่)
        if (!isFocusActive && !isBreakActive) {
            setFocusTimeLeft(calculateTotalSeconds(inputHours, inputMinutes, inputSeconds));
            setBreakTimeLeft(breakDuration * 60); 
        }
    }, [inputHours, inputMinutes, inputSeconds, breakDuration, isFocusActive, isBreakActive]);

    // Effect สำหรับ Focus Task Input
    useEffect(() => {
        if (isEditingTask) {
            taskInputRef.current?.focus();
            taskInputRef.current?.select();
        }
    }, [isEditingTask]);
    
    
    // Effect สำหรับจัดการคลิกนอก Input Fields (เพื่อปิดโหมดแก้ไข)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isTimeEditing && timeWrapperRef.current && !timeWrapperRef.current.contains(event.target)) {
                const isInputFocused = [hrsInputRef, minsInputRef, secsInputRef].some(
                    ref => ref.current === document.activeElement
                );
                
                if (!isInputFocused) {
                    setIsTimeEditing(false);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isTimeEditing]); 

    // Time Input Handlers
    const handleTimeInputChange = (e, unit) => {
        let stringValue = e.target.value.slice(0, 2); 
        let value = parseInt(stringValue, 10);
        
        if (isNaN(value)) value = 0;

        if (unit === 'hrs') {
            setInputHours(Math.max(0, value));
        } else if (unit === 'mins') {
            setInputMinutes(Math.max(0, Math.min(59, value)));
        } else if (unit === 'secs') {
            setInputSeconds(Math.max(0, Math.min(59, value)));
        }
    };
    
    const handleTimeInputBlur = () => {
        if (!isFocusActive && !isBreakActive) {
            let finalMins = inputMinutes % 60;
            let finalHrs = inputHours + Math.floor(inputMinutes / 60);
            
            const totalSeconds = calculateTotalSeconds(finalHrs, finalMins, inputSeconds);
            if (totalSeconds === 0) {
                finalHrs = 0;
                finalMins = 25;
                setInputSeconds(0);
            }
            
            setInputHours(finalHrs);
            setInputMinutes(finalMins);
        }
    };
    
    const handleDisplayClick = () => {
        if (!isFocusActive && !isBreakActive) {
            setIsTimeEditing(true);
            
            setTimeout(() => {
                hrsInputRef.current?.focus();
                hrsInputRef.current?.select();
            }, 0);
        }
    };
    
    const handleInputClick = (e) => {
        if (!isFocusActive && !isBreakActive) {
             e.target.focus(); 
             e.target.select(); 
        }
    };


    // Button Handlers 
 const handleStartFocus = () => {
        if (task.trim() === '' || task === 'What do you want to focus on?') {
            setTask('Focus Session');
        }

        // รีเซ็ตตัวนับวินาทีจริง
        actualFocusSecondsRef.current = 0; 
        hasSessionCompletedRef.current = false;
        hasBreakCompletedRef.current = false;

        setIsEditingTask(false);
        setIsTimeEditing(false);
        setIsFocusActive(true);
        setIsBreakActive(false);
    };

    const handleTakeBreak = () => {
        // หากกด Break ขณะอยู่ใน Focus Session
        if (actualFocusSecondsRef.current > 0) {
            saveActualFocus(actualFocusSecondsRef.current);
            actualFocusSecondsRef.current = 0; 
        }

        setIsFocusActive(false);

        const latestBreakDuration = getDurationInMinutes(sessionStorage.getItem('breakTime'));
        setBreakDuration(latestBreakDuration); 
        setBreakTimeLeft(latestBreakDuration * 60);

        hasBreakCompletedRef.current = false;
        
        setIsBreakActive(true);
    };

    const handleSkipBreak = () => {
        // หากกด Skip Break ให้เริ่ม Focus ต่อทันที
        startNextFocusSession(); 
    };
    
   const handleSkipFocus = () => {
        // บันทึกเวลาที่สะสมไว้ก่อนจะ Skip
        if (actualFocusSecondsRef.current > 0) {
            saveActualFocus(actualFocusSecondsRef.current);
            actualFocusSecondsRef.current = 0; // รีเซ็ต Ref
        }

        // หากกด Skip Focus ให้รีเซ็ตกลับไปหน้า Start (Idle State)
        setIsFocusActive(false);
        // focusTimeLeft จะถูกรีเซ็ตอัตโนมัติโดย useEffect ด้านบน 
    };


    const handleTaskSubmit = (e) => {
        e.preventDefault();
        if(task.trim() !== '') setIsEditingTask(false);
    };

    // กำหนดค่าสำหรับแสดงผล
    const timeFormatted = formatTime(focusTimeLeft);
    const breakTimeFormatted = formatTime(breakTimeLeft);
    const totalFocusMinutes = (inputHours * 60) + inputMinutes + (inputSeconds / 60);
    const formattedFocusDuration = formatSessionDuration(totalFocusMinutes);
    const formattedBreakDuration = formatSessionDuration(breakDuration);


    return (
        <div className="focus-page-container" >
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
                    {isBreakActive ? `Break (${formattedBreakDuration})` : `Focus (${formattedFocusDuration})`}
                </p>
               
                {isEditingTask ? (
                    <form onSubmit={handleTaskSubmit} className="task-form">
                        <input
                            ref={taskInputRef} type="text" value={task}
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
                    <div className="time-adjust-left"></div>
                    
                    {/* Component สำหรับแสดง/แก้ไขเวลา */}
                    <div className="timer-input-wrapper" ref={timeWrapperRef}> 
                        {isTimeEditing ? (
                            <div className="time-edit-mode">
                                <input
                                    ref={hrsInputRef} type="number"
                                    value={inputHours}
                                    onChange={(e) => handleTimeInputChange(e, 'hrs')}
                                    onBlur={handleTimeInputBlur}
                                    onClick={handleInputClick} 
                                    className="time-input-field time-input-hrs"
                                    maxLength={2} 
                                />
                                <span className="timer-separator">:</span>
                                <input
                                    ref={minsInputRef} type="number"
                                    value={inputMinutes}
                                    onChange={(e) => handleTimeInputChange(e, 'mins')}
                                    onBlur={handleTimeInputBlur}
                                    onClick={handleInputClick} 
                                    className="time-input-field"
                                    maxLength={2} 
                                />
                                <span className="timer-separator">:</span>
                                <input
                                    ref={secsInputRef} type="number"
                                    value={inputSeconds}
                                    onChange={(e) => handleTimeInputChange(e, 'secs')}
                                    onBlur={handleTimeInputBlur}
                                    onClick={handleInputClick} 
                                    className="time-input-field"
                                    maxLength={2} 
                                />
                            </div>
                        ) : (
                            <span className="timer-digits" onClick={handleDisplayClick}>
                                {timeFormatted.hrs}:{timeFormatted.mins}:{timeFormatted.secs}
                            </span>
                        )}
                    </div>

                    <div className="time-adjust-right"></div>
                </div>


                {isBreakActive && (
                    <div className="break-timer-wrapper">
                        <div className="break-timer-line"></div>
                        <div className="break-timer-content">
                            {/* แสดงผลเป็น MM:SS สำหรับเวลาพักด้านล่าง */}
                            <span>{breakTimeFormatted.mins}:{breakTimeFormatted.secs}</span>
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
           
           <footer className="focus-footer">
               
                <div className="footer-icons">                   
                    
                   
                </div>

                <div className="footer-icons">
                    <button className="footer-icon-button" title="Focus" onClick={() => navigate('/focus')}><BookText size={24} color="#FFF" /></button>
                    <button className="footer-icon-button" title="Home" onClick={() => navigate('/home')}><Home size={24} color="#FFF" /></button>
                    <button className="footer-icon-button" title="Streak" onClick={() => navigate('/streak')}><Flame size={24} color="#FFF" /></button>
                    <SettingsButton />
                </div>
            </footer>
        </div>
    );
};


export default FocusPage;