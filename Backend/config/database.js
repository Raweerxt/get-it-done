// config/database.js

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// สร้าง Instance ของ Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // ปิดการแสดง SQL query ใน Console
  }
);

// ฟังก์ชันสำหรับทดสอบการเชื่อมต่อ
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
  }
};

module.exports = { sequelize, connectDB };