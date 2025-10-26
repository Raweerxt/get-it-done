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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // 6 วันที่แล้ว + วันนี้ = 7 วัน

    try {
        // 1. ดึงข้อมูลดิบ 7 วันย้อนหลัง (ด้วย Prisma)
        const sessions = await prisma.focusSession.findMany({
            where: {
                userId: userId,
                createdAt: {
                    gte: sevenDaysAgo, // gte = Greater than or equal
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
            const d = new Date(sevenDaysAgo);
            d.setDate(sevenDaysAgo.getDate() + i);
            
            const dayKey = d.toISOString().split('T')[0]; // format YYYY-MM-DD
            const dayName = dayLabels[d.getUTCDay()]; // 'Sun', 'Mon', ...
            
            weeklyDataMap.set(dayKey, { day: dayName, hours: 0 });
        }

        // 4. (Process ใน JS) เติมข้อมูลจาก DB
        sessions.forEach(session => {
            const sessionDateKey = session.createdAt.toISOString().split('T')[0];
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


module.exports = router;