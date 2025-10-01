// index.js (โค้ดฉบับสมบูรณ์)

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { sequelize, connectDB } = require('./config/database'); 
// Import Models เพื่อให้ Sequelize รู้จักตาราง
const User = require('./models/User'); 
const Session = require('./models/Session'); 
// Import Route ที่เราเพิ่งสร้าง
const authRoutes = require('./routes/auth'); 

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 5000; 

// --- Middleware ---
//app.use(cors({ origin: 'http://localhost:3000' }));

// อนุญาตทุกอย่างชั่วคราว
app.use(cors());

// ต้องใช้ express.json() ก่อน Routes เพื่อให้รับ req.body ได้
app.use(express.json()); 

// --- Routes Middleware ---
// กำหนดให้ทุก request ที่ขึ้นต้นด้วย /api/auth ให้ใช้ authRoutes
app.use('/api/auth', authRoutes); 

// --- ฟังก์ชัน Start Server ---
const startServer = async () => {
    // 1. ทดสอบและเชื่อมต่อฐานข้อมูล
    await connectDB(); 

    // 2. ซิงค์ Model กับ Database (สร้างตารางถ้ายังไม่มี)
    await sequelize.sync({ alter: true }); 
    console.log("✅ Database structure synced successfully.");

    // 3. Start Express Server
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

// --- Test Route ---
app.get('/', (req, res) => {
    res.status(200).json({ message: 'GetItDone Backend API is running!' });
});


// เริ่มกระบวนการทั้งหมด
startServer();