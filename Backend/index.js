const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// นำเข้า Routes
const authRoutes = require('./routes/auth');
const focusApiRoutes = require('./routes/focusApi');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json()); // ให้ Express อ่าน req.body (JSON)

// Routes Middleware (เช็ค path ให้ตรงกับที่ Frontend เรียก)
app.use('/api/auth', authRoutes);
app.use('/api/v1', focusApiRoutes);

// Test Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'GetItDone Backend API is running! (Prisma Version)' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT} (Using Prisma)`);
});

