const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// 1. นำเข้า Routes (ที่เขียนด้วย Prisma แล้ว)
const authRoutes = require('./routes/auth');
const focusApiRoutes = require('./routes/focusApi');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000; // (ใช้ Port 8000 ตาม .env ของคุณ)

// --- Middleware ---
app.use(cors()); // อนุญาตทุกอย่าง
app.use(express.json()); // ให้ Express อ่าน req.body (JSON)

// --- Routes Middleware ---
// (เช็ค path ให้ตรงกับที่ Frontend เรียก)
app.use('/api/auth', authRoutes); // /api/auth/login, /api/auth/signup
app.use('/api/v1', focusApiRoutes);  // /api/v1/focus-sessions, /api/v1/stats/total

// --- Test Route ---
app.get('/', (req, res) => {
    res.status(200).json({ message: 'GetItDone Backend API is running! (Prisma Version)' });
});

// --- Start Server ---
// (Prisma ไม่ต้องการ connectDB หรือ sync ที่นี่)
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT} (Using Prisma)`);
});

// ❌ (ลบ function startServer() และ connectDB() และ sequelize.sync() ทั้งหมด)
