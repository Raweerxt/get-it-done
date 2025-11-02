import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Streak.css'; 
import SettingsButton from '../../components/Button/Setting'; 
import fireStreak from '../../assets/fireStreak.png';
import { BookText, Home, Flame } from 'lucide-react'; 

import { Line } from 'react-chartjs-2'; 

// นำเข้าสิ่งที่ Chart.js ต้องใช้
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

// Component ที่จะใช้
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

    // STATE & EFFECT สำหรับสถิติ
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
                console.warn("No token found. Using mock data for stats.");
                
                // ข้อมูลจำลอง
                const mockData = {
                   totalTimeAllTimeMinutes: 0,
                   currentStreak: 0,
                   last7Days: [ 
                     { day: 'Sun', totalMinutes: 0 },
                     { day: 'Mon', totalMinutes: 0 },
                     { day: 'Tue', totalMinutes: 0 },
                     { day: 'Wed', totalMinutes: 0 },
                     { day: 'Thu', totalMinutes: 0 },
                     { day: 'Fri', totalMinutes: 0 },
                     { day: 'Sat', totalMinutes: 0 }
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
                return;
            }

            // ถ้ามี Token ให้ดึงข้อมูลจริง
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
    }, []);
    //  แปลง Data ให้ Chart.js ใช้งานได้
    // ใช้ React.useMemo เพื่อไม่ให้มันคำนวณใหม่ทุกครั้งที่ re-render
    const chartJsData = React.useMemo(() => {
        
        const labels = chartData.map(item => item.day);  // วัน
        const data = chartData.map(item => item.h);      // ชั่วโมง

        return {
            labels: labels,
            datasets: [{
                label: 'Time spent',
                data: data,
                borderColor: '#8A2BE2',
                backgroundColor: 'rgba(138, 43, 226, 0.2)',
                fill: true,
                tension: 0.3
            }]
        };
    }, [chartData]); // คำนวณใหม่เมื่อ chartData เปลี่ยน

    // ตั้งค่า Option ของกราฟ
    const chartJsOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
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

    return (
        <div className="streak-page-container" >
            
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
                    <div className="stats-content-box">
                        <h1 className="stats-title">Statistics</h1>
                        
                        {/* กราฟ */}
                        <div className="stats-chart-wrapper" style={{ height: '300px' }}>
                            <Line options={chartJsOptions} data={chartJsData} />
                        </div>

                        {/* ส่วนสรุปด้านล่าง */}
                        <div className="stats-summary-wrapper">
                            
                            <div className="stats-card total-time-card">
                                <span className="stats-card-label">Total time spent:</span>
                                <span className="stats-card-value">{totalTimeSpent} hours</span>
                            </div>
                            
                            <div className="stats-card streak-card">
                                <img
                                    src={fireStreak}
                                    alt="Streak Fire"
                                    style={{ width: 42, height: 54, filter: 'drop-shadow(0 0 0 #FF6B00)' }}
                                />
                                <span className="stats-card-value">{streak}</span>
                            </div>

                        </div>
                    </div>
                )} 
                
            </main>

            
            {/* Footer / Navigation Icons */}
            <footer className="streak-footer">
                
                {/* Left Side Icons */}
                <div className="footer-icons">
                    
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