const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// นำเข้า Prisma Client
const { prisma } = require('../prisma/client');

// Route: POST /api/auth/signup (สมัครสมาชิก)
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'กรุณากรอก Username และ Password' });
    }

    try {
        // ตรวจสอบ Username ซ้ำ ด้วย Prisma
        const existingUser = await prisma.user.findUnique({
            where: { username: username }
        });

        if (existingUser) {
            return res.status(409).json({ message: 'Username นี้ถูกใช้งานแล้ว' });
        }

        // เข้ารหัสรหัสผ่าน
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // บันทึก User ใหม่ ด้วย Prisma
        const newUser = await prisma.user.create({
            data: {
                username: username,
                password: hashedPassword,
            }
        });

        // สร้าง JWT Token
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'สมัครสมาชิกสำเร็จ!',
            token: token,
            user: { id: newUser.id, username: newUser.username }
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
    }
});

// Route: POST /api/auth/login (เข้าสู่ระบบ)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'กรุณากรอก Username และ Password' });
    }

    try {
        // ค้นหา User ด้วย Prisma
        const user = await prisma.user.findUnique({
            where: { username: username }
        });

        if (!user) {
            return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
        }

        // เปรียบเทียบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
        }

        // สร้าง JWT Token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // ตอบกลับสำเร็จ
        res.status(200).json({
            message: 'เข้าสู่ระบบสำเร็จ!',
            token: token,
            user: { id: user.id, username: user.username }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
    }
});

module.exports = router;