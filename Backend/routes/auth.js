const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const User = require('../models/User'); 

// **********************************************
// Route: POST /api/auth/signup (สำหรับสมัครสมาชิก)
// **********************************************
router.post('/signup', async (req, res) => {
    const { username, password } = req.body; 

    if (!username || !password) {
        return res.status(400).json({ message: 'กรุณากรอก Username และ Password ให้ครบถ้วน' });
    }

    try {
        // 1. ตรวจสอบ Username ซ้ำ
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ message: 'Username นี้ถูกใช้งานแล้ว' });
        }

        // 2. เข้ารหัสรหัสผ่าน
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. บันทึก User ใหม่
        const newUser = await User.create({
            username,
            password: hashedPassword, 
        });

        // 4. สร้าง JWT Token
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 5. ตอบกลับสำเร็จ
        res.status(201).json({ 
            message: 'สมัครสมาชิกสำเร็จ! ยินดีต้อนรับสู่ GetItDone',
            token,
            userId: newUser.id,
            username: newUser.username // เพิ่ม username เพื่อให้ Frontend เก็บได้
        });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
    }
});

// ----------------------------------------------
// **********************************************
// 🛑 Route: POST /api/auth/signin (สำหรับเข้าสู่ระบบ)
// **********************************************
router.post('/signin', async (req, res) => {
    const { username, password } = req.body; 

    if (!username || !password) {
        return res.status(400).json({ message: 'กรุณากรอก Username และ Password ให้ครบถ้วน' });
    }

    try {
        // 1. ค้นหา User จาก username
        const user = await User.findOne({ where: { username } });
        
        // ตรวจสอบว่ามี User นี้หรือไม่
        if (!user) {
            // ใช้ 401 Unauthorized เพื่อไม่ให้รู้ว่าผิดที่ username หรือ password
            return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
        }

        // 2. เปรียบเทียบรหัสผ่านที่กรอกมากับรหัสผ่านที่ถูกเข้ารหัสใน DB
        const isMatch = await bcrypt.compare(password, user.password);

        // ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
        if (!isMatch) {
            return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
        }

        // 3. สร้าง JWT Token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 4. ตอบกลับสำเร็จ
        res.status(200).json({ 
            message: 'เข้าสู่ระบบสำเร็จ!',
            token,
            userId: user.id,
            username: user.username
        });

    } catch (error) {
        console.error('Signin Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงชื่อเข้าใช้' });
    }
});

module.exports = router;