// models/User.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // ทำให้ username ไม่ซ้ำกัน
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false, // เก็บ password ที่ถูก hash แล้ว
    },
}, {
    timestamps: true, 
    tableName: 'users' 
});

module.exports = User;