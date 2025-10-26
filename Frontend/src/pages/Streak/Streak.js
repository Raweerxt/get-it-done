import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Streak.css'; 
import backgroundImage from '../../assets/bg.png'; 
import SettingsButton from '../../components/Button/Setting'; 
// นำเข้า Icon ที่จำเป็น (ลบ PaintBucket ออก)
import { BookText, Home, Flame } from 'lucide-react'; 
// นำเข้า BackgroundButton Component ใหม่
import BackgroundButton from '../../components/Button/SelectBg'; 
import AmbientSoundSelector from '../../components/Button/Sounds';

import { Line } from 'react-chartjs-2'; 

// 2. นำเข้าสิ่งที่ Chart.js ต้องใช้ (สำคัญมาก)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// 3. ลงทะเบียน Component ที่จะใช้ (สำคัญมาก)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StreakPage = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [currentTime, setCurrentTime] = useState(''); 

    // 1. State สำหรับ Background
    const defaultBgUrl = backgroundImage; 
    const [currentBackground, setCurrentBackground] = useState(() => {
        return sessionStorage.getItem('selectedBackground') || defaultBgUrl;
    }); 

    // 🛑 State ใหม่: ควบคุม Modal ที่กำลังเปิดอยู่ (สามารถเป็น 'background', 'sound', หรือ null)
    const [openModal, setOpenModal] = useState(null);
    
    // 2. ฟังก์ชัน Callback สำหรับเปลี่ยนพื้นหลัง
    const handleBackgroundSelect = (bgUrl) => {
        setCurrentBackground(bgUrl);
        sessionStorage.setItem('selectedBackground', bgUrl); 
    };


    // 🛑 ฟังก์ชันใหม่: ใช้เพื่อเปิด Modal
    const handleOpenModal = (modalName) => {
        // ถ้า Modal ที่กดซ้ำคืออันที่เปิดอยู่ ให้ปิดมัน
        if (openModal === modalName) {
            setOpenModal(null);
        } else {
            // เปิด Modal ใหม่
            setOpenModal(modalName);
        }
    };

    // --- STATE & EFFECT สำหรับสถิติ ---
    const [chartData, setChartData] = useState([]);
    const [totalTimeSpent, setTotalTimeSpent] = useState(0);
    const [streak, setStreak] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            let token = null;
            if (typeof sessionStorage !== 'undefined') {
                 token = sessionStorage.getItem('token');
            }

            if (!token) {
                // 🛑 ใช้ข้อมูลจำลอง (Mock Data) ถ้าไม่มี Token
                // เพื่อให้คุณเห็นหน้าจอตอนยังไม่ได้เชื่อมต่อ Backend
                console.warn("No token found. Using mock data for stats.");
                
                // ข้อมูลจำลอง
                const mockData = {
                   totalTimeAllTimeMinutes: 1200, // 20 hours
                   currentStreak: 6,
                   last7Days: [ 
                     { day: 'Sun', totalMinutes: 180 }, // 3h
                     { day: 'Mon', totalMinutes: 240 }, // 4h
                     { day: 'Tue', totalMinutes: 120 }, // 2h
                     { day: 'Wed', totalMinutes: 60 },  // 1h
                     { day: 'Thu', totalMinutes: 120 }, // 2h
                     { day: 'Fri', totalMinutes: 0 },   // 0h
                     { day: 'Sat', totalMinutes: 300 }  // 5h
                   ]
                };
                
                // Process mock data
                const formattedChartData = mockData.last7Days.map(item => ({
                    day: item.day,
                    h: parseFloat((item.totalMinutes / 60).toFixed(1)) 
                }));
                setChartData(formattedChartData);
                setTotalTimeSpent(Math.floor(mockData.totalTimeAllTimeMinutes / 60));
                setStreak(mockData.currentStreak);
                setIsLoading(false);
                return; // จบการทำงาน
            }

            // --- ถ้ามี Token ให้ดึงข้อมูลจริง ---
            try {
                const response = await fetch('/api/v1/statistics', { 
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch statistics');
                }
                
                const data = await response.json();

                const formattedChartData = data.last7Days.map(item => ({
                    day: item.day,
                    h: parseFloat((item.totalMinutes / 60).toFixed(1)) 
                }));
                setChartData(formattedChartData);
                setTotalTimeSpent(Math.floor(data.totalTimeAllTimeMinutes / 60));
                setStreak(data.currentStreak);

            } catch (err) {
                setError(err.message);
                console.error("Error fetching stats:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatistics();
    }, []); // [] ให้ทำงานแค่ครั้งเดียวตอนเปิดหน้า
    // -------------------------------------------

    // ✅ 1. แปลง Data ให้ Chart.js ใช้งานได้
    // (ใช้ React.useMemo เพื่อไม่ให้มันคำนวณใหม่ทุกครั้งที่ re-render)
    const chartJsData = React.useMemo(() => {
        // chartData ของเราคือ: [{day: 'Sun', h: 3}, {day: 'Mon', h: 4}, ...]
        
        // Chart.js ต้องการ:
        const labels = chartData.map(item => item.day);  // ['Sun', 'Mon', ...]
        const data = chartData.map(item => item.h);      // [3, 4, ...]

        return {
            labels: labels,
            datasets: [{
                label: 'Time spent', // ชื่อที่แสดงใน tooltip
                data: data,
                borderColor: '#8A2BE2', // สีม่วง (สีเดิมของคุณ)
                backgroundColor: 'rgba(138, 43, 226, 0.2)', // สีพื้นหลัง (เพิ่มให้สวย)
                fill: true,
                tension: 0.3 // ทำให้เส้นโค้งมน (เหมือน 'monotone')
            }]
        };
    }, [chartData]); // คำนวณใหม่เมื่อ chartData เปลี่ยน

    // ✅ 2. ตั้งค่า Option ของกราฟ
    const chartJsOptions = {
        responsive: true, // ทำให้กราฟย่อขยายตามขนาด
        maintainAspectRatio: false, // สำคัญมาก! เพื่อให้เรากำหนดความสูงเองได้
        plugins: {
            legend: {
                display: false // ซ่อนปุ่ม Legend ด้านบน (กราฟเดิมไม่มี)
            },
            tooltip: {
                // ปรับแต่ง tooltip ให้เหมือนของเดิม
                callbacks: {
                    label: function(context) {
                        return `Time spent: ${context.parsed.y} hours`;
                    }
                }
            }
        },
        scales: {
            y: {
                // ปรับแต่งแกน Y ให้มี 'h' ต่อท้าย
                ticks: {
                    callback: function(value) {
                        return `${value} h`;
                    }
                }
            }
        }
    };

    const handleNavClick = (path) => {
        console.log(`Navigating to ${path}`);
    };

    return (
        <div 
            className="streak-page-container"
            style={{ backgroundImage: `url(${currentBackground})` }}
        >
            
            {/* Header / Quote */}
            <header className="streak-header">
                <div className="app-branding">
                    <span className="app-name">GetItDone</span>
                    <p className="app-subtitle">by Muk and Cream</p>
                </div>
                <div className="app-quote">
                    <p>"Strive for progress,</p>
                    <p>not perfection"</p>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="streak-main-content">
                 {isLoading ? (
                    <div className="stats-loading">Loading Statistics...</div>
                ) : error ? (
                    <div className="stats-error">Error: {error}</div>
                ) : (
                    // (A) กล่องเนื้อหาหลัก (พื้นหลังเบลอ)
                    <div className="stats-content-box">
                        <h1 className="stats-title">Statistics</h1>
                        
                        {/* (B) ส่วนของกราฟ */}
                        <div className="stats-chart-wrapper" style={{ height: '300px' }}>
                            {/* Chart.js ไม่ต้องใช้ ResponsiveContainer
                                แต่เราต้องกำหนดความสูงให้ div แม่ของมันแทน (300px)
                            */}
                            <Line options={chartJsOptions} data={chartJsData} />
                        </div>

                        {/* (C) ส่วนสรุปด้านล่าง */}
                        <div className="stats-summary-wrapper">
                            
                            <div className="stats-card total-time-card">
                                <span className="stats-card-label">Total time spent:</span>
                                <span className="stats-card-value">{totalTimeSpent} hours</span>
                            </div>
                            
                            <div className="stats-card streak-card">
                                <Flame size={48} color="#FF6B00" />
                                <span className="stats-card-value">{streak}</span>
                            </div>

                        </div>
                    </div> // (ปิด stats-content-box)
                )} 
                
            </main>

            
            {/* Footer / Navigation Icons */}
            <footer className="streak-footer">
                
                {/* Left Side Icons */}
                <div className="footer-icons">
                    {/* 🛑 เปลี่ยนปุ่ม Music เดิม เป็น AmbientSoundSelector */}
                    <AmbientSoundSelector
                        isOpen={openModal === 'sound'} // ส่งสถานะว่า Modal นี้ควรเปิดหรือไม่
                        onToggle={() => handleOpenModal('sound')} // ส่งฟังก์ชันสำหรับเปิด/ปิดตัวเอง
                    />
                    
                    {/* BackgroundButton */}
                    <BackgroundButton 
                        isOpen={openModal === 'background'} // ส่งสถานะว่า Modal นี้ควรเปิดหรือไม่
                        onToggle={() => handleOpenModal('background')} // ส่งฟังก์ชันสำหรับเปิด/ปิดตัวเอง
                        onSelectBackground={handleBackgroundSelect}
                    />
                    
                </div>

                {/* Right Side Icons (Navigation) */}
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

export default StreakPage;