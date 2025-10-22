const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// ✅ 1. แก้ไข Path ให้ถูกต้องตามรูปของคุณ
const { prisma } = require('../prisma/client'); // <-- Path นี้ถูกต้อง 100%

// Middleware สำหรับตรวจสอบ Token (ต้องมี!)
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = decoded; 
        next(); 
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// **********************************************
// Route: POST /api/v1/focus-sessions
// (Frontend จะเรียกมาที่นี่)
// **********************************************
router.post('/focus-sessions', authMiddleware, async (req, res) => {
    const { taskName, durationMinutes } = req.body;
    const { id: userId } = req.user; 

    if (!taskName || !durationMinutes) {
        return res.status(400).json({ message: 'Missing taskName or durationMinutes' });
    }

    try {
        const newSession = await prisma.focusSession.create({
            data: {
                taskName: taskName,
                durationMinutes: durationMinutes,
                userId: userId, 
            }
        });

        res.status(201).json({ message: 'Focus session saved!', data: newSession });

    } catch (error) {
        console.error("Error saving focus session:", error);
        res.status(500).json({ message: 'Failed to save focus session' });
    }
});

module.exports = router;

