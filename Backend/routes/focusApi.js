// routes/focusApi.js
// (เวอร์ชันอัปเกรดด้วย PRISMA + API สถิติ)

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// ✅ เปลี่ยน!! นำเข้า Prisma Client ตัวเดียวกัน
const { prisma } = require('../prisma/client'); // (แก้ path ให้ถูก)

// Middleware สำหรับตรวจสอบ Token (อันเดิมของคุณ ดีอยู่แล้ว)
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id: ..., username: ... }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// 1. แปลง durationMinutes (float) เป็นรูปแบบ HH:MM:SS
const formatDuration = (duration) => {
    // แปลงจาก Minutes (float) เป็น Seconds (integer)
    const totalSeconds = Math.round(duration * 60); 

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // PadStart เพื่อให้มี 2 หลักเสมอ (01:05:07)
    const pad = (num) => String(num).padStart(2, '0');

    // รูปแบบ 01:30:30
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

// 2. แปลง UTC timestamp เป็น Thai Time (GMT+7) และจัดรูปแบบ
const formatThaiTime = (utcDate) => {
    const date = new Date(utcDate);
    
    // ตั้งค่าตัวเลือกการจัดรูปแบบสำหรับเวลาประเทศไทย
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // ใช้รูปแบบ 24 ชั่วโมง
        timeZone: 'Asia/Bangkok' // ไทม์โซนประเทศไทย (GMT+7)
    };

    // ใช้ 'en-GB' เพื่อให้ได้รูปแบบ DD/MM/YYYY
    const thaiTimeStr = date.toLocaleString('en-GB', options); 
    
    // จัดรูปแบบผลลัพธ์ให้เป็น YYYY/MM/DD, HH:MM:SS
    // 'en-GB' จะได้ "DD/MM/YYYY, HH:MM:SS"
    const parts = thaiTimeStr.split(', ');
    const [day, month, year] = parts[0].split('/');
    
    return `${year}/${month}/${day}, ${parts[1]}`;
};

// =============================================
// 1. API สำหรับ "บันทึก" เวลา (จากหน้า Focus.js)
// (POST /api/v1/focus-sessions)
// =============================================
router.post('/focus-sessions', authMiddleware, async (req, res) => {
    const { taskName, durationMinutes } = req.body;
    const { id: userId } = req.user;

    if (!durationMinutes || durationMinutes <= 0) {
        return res.status(400).json({ message: 'Duration must be greater than 0' });
    }

    try {
        // ✅ โค้ด Prisma (ของคุณถูกต้องอยู่แล้ว)
        const newSession = await prisma.focusSession.create({
            data: {
                taskName: taskName || 'Focus Session', // ใส่ค่า default
                durationMinutes: durationMinutes,
                userId: userId, // เชื่อมโยงกับ User ที่ login
            }
        });

        res.status(201).json({ message: 'Focus session saved!', data: newSession });

    } catch (error) {
        console.error("Error saving focus session:", error);
        res.status(500).json({ message: 'Failed to save focus session' });
    }
});

// =============================================
// 🆕 API สำหรับ "ดึงรายการ" Session ทั้งหมด พร้อมจัดรูปแบบ
// (GET /api/v1/focus-sessions/list)
// =============================================
router.get('/focus-sessions/list', authMiddleware, async (req, res) => {
    const { id: userId } = req.user;

    try {
        // ดึงข้อมูลทั้งหมด
        const sessions = await prisma.focusSession.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' } // ล่าสุดอยู่บนสุด
        });

        // ✅ วนลูปเพื่อแปลงค่าตามที่ต้องการ
        const formattedSessions = sessions.map(session => ({
            ...session,
            // 1. แปลง durationMinutes เป็น HH:MM:SS
            durationFormatted: formatDuration(session.durationMinutes), 
            
            // 2. แปลง createdAt เป็น Thai Time (GMT+7)
            createdAtThai: formatThaiTime(session.createdAt), 
        }));

        res.status(200).json(formattedSessions);

    } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ message: 'Failed to fetch focus sessions' });
    }
});

// =============================================
// 2. API สำหรับหน้าสถิติ: "Total time spent" (ซ้ายล่าง)
// (GET /api/v1/stats/total)
// =============================================
router.get('/stats/total', authMiddleware, async (req, res) => {
    const { id: userId } = req.user;

    try {
        // ✅ ใช้ Prisma aggregate เพื่อ SUM
        const result = await prisma.focusSession.aggregate({
            _sum: {
                durationMinutes: true
            },
            where: {
                userId: userId
            }
        });
        
        const totalMinutes = result._sum.durationMinutes || 0;
        const totalHours = Math.floor(totalMinutes / 60);

        res.status(200).json({
            totalMinutes: totalMinutes,
            totalHours: totalHours
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch total stats' });
    }
});


// =============================================
// 3. API สำหรับหน้าสถิติ: "กราฟ 7 วัน"
// (GET /api/v1/stats/weekly)
// =============================================
router.get('/stats/weekly', authMiddleware, async (req, res) => {
    const { id: userId } = req.user;
    
    // 🛑 [ปรับแก้ 1] ใช้ Date.now() เพื่อคำนวณเวลาเริ่มต้น/สิ้นสุดของวันนี้ใน UTC
    const now = new Date();
    
    // 🛑 [ปรับแก้ 2] คำนวณขอบเขตเวลาของวันนี้ใน UTC
    // วันที่เริ่มต้นของวันนี้ใน UTC
    const todayUTCStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)); 

    // วันที่ 7 วันย้อนหลังใน UTC (รวมวันนี้เป็น 7 วัน)
    const sevenDaysAgoUTCStart = new Date(todayUTCStart);
    sevenDaysAgoUTCStart.setUTCDate(todayUTCStart.getUTCDate() - 6); 

    try {
        // 1. ดึงข้อมูลดิบ 7 วันย้อนหลัง (ด้วย Prisma)
        const sessions = await prisma.focusSession.findMany({
            where: {
                userId: userId,
                createdAt: {
                    gte: sevenDaysAgoUTCStart, // ใช้เวลาเริ่มต้น 7 วันย้อนหลังแบบ UTC
                }
            },
            select: {
                durationMinutes: true,
                createdAt: true
            }
        });

        // 2. สร้าง Array 7 วัน (Sun, Mon, ...)
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let weeklyDataMap = new Map();
        
        // 3. (Process ใน JS) วนลูป 7 วันเพื่อสร้างข้อมูลตั้งต้น
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgoUTCStart);
            d.setUTCDate(sevenDaysAgoUTCStart.getUTCDate() + i);
            
            // 🛑 [ปรับแก้ 3] ใช้ getUTCFullYear/Month/Date เพื่อสร้าง Key ที่อ้างอิง UTC
            const dayKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
            const dayName = dayLabels[d.getUTCDay()]; 
            
            weeklyDataMap.set(dayKey, { day: dayName, hours: 0 });
        }

        // 4. (Process ใน JS) เติมข้อมูลจาก DB
        sessions.forEach(session => {
            // 🛑 [ปรับแก้ 4] ใช้ getUTCFullYear/Month/Date เพื่อสร้าง Key จากข้อมูล DB (ซึ่งเป็น UTC)
            const d = session.createdAt;
            const sessionDateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
            
            if (weeklyDataMap.has(sessionDateKey)) {
                const dayData = weeklyDataMap.get(sessionDateKey);
                dayData.hours += (session.durationMinutes / 60);
                weeklyDataMap.set(sessionDateKey, dayData);
            }
        });
        
        // 5. แปลง Map เป็น Array
        const weeklyData = Array.from(weeklyDataMap.values()).map(data => ({
            ...data,
            hours: parseFloat(data.hours.toFixed(1))
        }));

        res.status(200).json(weeklyData);

    } catch (error) {
        console.error("Weekly stats error:", error);
        res.status(500).json({ message: 'Failed to fetch weekly stats' });
    }
});


// =============================================
// 4. API สำหรับหน้าสถิติ: "Streak" (รูปไฟ 🔥)
// (GET /api/v1/stats/streak)
// =============================================
router.get('/stats/streak', authMiddleware, async (req, res) => {
    const { id: userId } = req.user;

    try {
        // 1. ดึง "วันที่" ที่มีการโฟกัส "ทั้งหมด"
        const allSessions = await prisma.focusSession.findMany({
            where: { userId: userId },
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' }
        });

        if (allSessions.length === 0) {
            return res.status(200).json({ streak: 0 });
        }

        // 2. (Process ใน JS) สร้าง Set ของวันที่ (YYYY-MM-DD) ที่ไม่ซ้ำ
        const dateSet = new Set(
            allSessions.map(s => s.createdAt.toISOString().split('T')[0])
        );

        // 3. (Process ใน JS) เริ่มนับ Streak
        let currentStreak = 0;
        let today = new Date();
        const todayKey = today.toISOString().split('T')[0];
        
        let yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().split('T')[0];
        
        let dayToTest;

        // 3.1 ตรวจสอบว่า "วันนี้" ทำหรือยัง
        if (dateSet.has(todayKey)) {
            currentStreak = 1;
            dayToTest = new Date(today); // เริ่มนับถอยหลังจากวันนี้
        } 
        // 3.2 ถ้าวันนี้ยังไม่ทำ, ตรวจสอบว่า "เมื่อวาน" ทำหรือไม่
        else if (dateSet.has(yesterdayKey)) {
            currentStreak = 1;
            dayToTest = new Date(yesterday); // เริ่มนับถอยหลังจากเมื่อวาน
        } 
        // 3.3 ถ้าทั้งวันนี้และเมื่อวานไม่ได้ทำเลย = streak = 0
        else {
            return res.status(200).json({ streak: 0 });
        }
        
        // 4. วนลูปนับถอยหลัง
        // (เริ่มจาก i = 1 เพราะเรานับ dayToTest (วันนี้/เมื่อวาน) เป็น 1 แล้ว)
        for (let i = 1; i < dateSet.size; i++) {
            let previousDay = new Date(dayToTest);
            previousDay.setDate(dayToTest.getDate() - i);
            
            const previousDayKey = previousDay.toISOString().split('T')[0];

            if (dateSet.has(previousDayKey)) {
                // ถ้ามีวันก่อนหน้าติดกัน
                currentStreak++;
            } else {
                // ถ้าไม่ติดกัน หยุดนับ
                break;
            }
        }
        
        res.status(200).json({ streak: currentStreak });

    } catch (error) {
        console.error("Streak error:", error);
        res.status(500).json({ message: 'Failed to fetch streak' });
    }
});

router.get('/statistics', authMiddleware, async (req, res) => {
    const { id: userId } = req.user;

    try {
        // --- 1. Logic ดึง Total Time (จาก /stats/total) ---
        const totalResult = await prisma.focusSession.aggregate({
            _sum: { durationMinutes: true },
            where: { userId: userId }
        });
        const totalTimeAllTimeMinutes = totalResult._sum.durationMinutes || 0;

        // --- 2. Logic ดึง Weekly (จาก /stats/weekly) [ปรับเล็กน้อย] ---
        const now = new Date();
        const todayUTCStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)); 
        const sevenDaysAgoUTCStart = new Date(todayUTCStart);
        sevenDaysAgoUTCStart.setUTCDate(todayUTCStart.getUTCDate() - 6);

        const sessions = await prisma.focusSession.findMany({
            where: {
                userId: userId,
                createdAt: { gte: sevenDaysAgoUTCStart } // 👈 ใช้ UTC Start
            },
            select: { durationMinutes: true, createdAt: true }
        });

        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let weeklyDataMap = new Map();

        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgoUTCStart);
            d.setUTCDate(sevenDaysAgoUTCStart.getUTCDate() + i);
            
            // 💡 ใช้ getUTCFullYear/Month/Date เพื่อสร้าง Key ที่อ้างอิง UTC
            const dayKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
            const dayName = dayLabels[d.getUTCDay()]; 
            
            weeklyDataMap.set(dayKey, { day: dayName, totalMinutes: 0 });
        }

        sessions.forEach(session => {
            // 💡 ใช้ getUTCFullYear/Month/Date เพื่อสร้าง Key จากข้อมูล DB (ซึ่งเป็น UTC)
            const d = session.createdAt;
            const sessionDateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
            
            if (weeklyDataMap.has(sessionDateKey)) {
                const dayData = weeklyDataMap.get(sessionDateKey);
                dayData.totalMinutes += session.durationMinutes; 
                weeklyDataMap.set(sessionDateKey, dayData);
            }
        });
        
        const last7Days = Array.from(weeklyDataMap.values());


        // --- 3. Logic ดึง Streak (จาก /stats/streak) ---
        const allSessions = await prisma.focusSession.findMany({
            where: { userId: userId },
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' }
        });

        let currentStreak = 0;
        if (allSessions.length > 0) {
            const dateSet = new Set(
                allSessions.map(s => s.createdAt.toISOString().split('T')[0])
            );

            let todayCheck = new Date();
            const todayKey = todayCheck.toISOString().split('T')[0];
            
            let yesterdayCheck = new Date(todayCheck);
            yesterdayCheck.setDate(todayCheck.getDate() - 1);
            const yesterdayKey = yesterdayCheck.toISOString().split('T')[0];
            
            let dayToTest;

            if (dateSet.has(todayKey)) {
                currentStreak = 1;
                dayToTest = new Date(todayCheck);
            } else if (dateSet.has(yesterdayKey)) {
                currentStreak = 1;
                dayToTest = new Date(yesterdayCheck);
            } else {
                currentStreak = 0;
            }
            
            if (currentStreak > 0) {
                 for (let i = 1; i < dateSet.size; i++) {
                    let previousDay = new Date(dayToTest);
                    previousDay.setDate(dayToTest.getDate() - i);
                    const previousDayKey = previousDay.toISOString().split('T')[0];

                    if (dateSet.has(previousDayKey)) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }
        }

        // --- 4. รวบตึงข้อมูลทั้งหมดส่งกลับ ---
        res.status(200).json({
            totalTimeAllTimeMinutes: totalTimeAllTimeMinutes,
            currentStreak: currentStreak,
            last7Days: last7Days 
        });

    } catch (error) {
        console.error("Combined Statistics Error:", error);
        res.status(500).json({ message: 'Failed to fetch statistics' });
    }
});

module.exports = router;