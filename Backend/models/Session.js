// models/Session.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User'); // นำเข้า User Model

const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    workTimeMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    sessionDate: {
        type: DataTypes.DATEONLY, // เก็บเฉพาะวันที่
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'sessions'
});

// กำหนดความสัมพันธ์: One-to-Many
User.hasMany(Session, {
    foreignKey: 'userId', 
    onDelete: 'CASCADE'
});
Session.belongsTo(User, { foreignKey: 'userId' });

module.exports = Session;