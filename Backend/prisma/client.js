const { PrismaClient } = require('@prisma/client');

let globalPrismaClient;

if (!globalPrismaClient) {
  globalPrismaClient = new PrismaClient();
}

module.exports = {
  prisma: globalPrismaClient,
};

