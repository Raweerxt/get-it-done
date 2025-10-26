// prisma/client.js
const { PrismaClient } = require('@prisma/client');

// สร้าง instance เดียวและ export ไปใช้
const prisma = new PrismaClient();

module.exports = { prisma };