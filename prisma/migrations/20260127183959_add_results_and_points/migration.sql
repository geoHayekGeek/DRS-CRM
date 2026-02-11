-- CreateEnum
CREATE TYPE "PointsMultiplier" AS ENUM ('NORMAL', 'HALF', 'DOUBLE');

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "points_multiplier" "PointsMultiplier";

-- CreateTable
CREATE TABLE "session_results" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_results_session_id_driver_id_key" ON "session_results"("session_id", "driver_id");

-- AddForeignKey
ALTER TABLE "session_results" ADD CONSTRAINT "session_results_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_results" ADD CONSTRAINT "session_results_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
