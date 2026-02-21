-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PENDING', 'READY', 'COMPLETED');

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN "status" "SessionStatus" NOT NULL DEFAULT 'READY';
