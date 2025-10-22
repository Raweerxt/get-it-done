/*
  Warnings:

  - You are about to drop the `focus_sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "focus_sessions" DROP CONSTRAINT "focus_sessions_userId_fkey";

-- DropTable
DROP TABLE "focus_sessions";

-- CreateTable
CREATE TABLE "FocusSession" (
    "id" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FocusSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FocusSession" ADD CONSTRAINT "FocusSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
