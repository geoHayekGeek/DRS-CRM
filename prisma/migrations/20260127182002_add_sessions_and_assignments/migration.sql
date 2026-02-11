-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('QUALIFYING', 'RACE', 'FINAL_QUALIFYING', 'FINAL_RACE');

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "type" "SessionType" NOT NULL,
    "group" TEXT,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_assignments" (
    "id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "kart_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_assignments_round_id_driver_id_key" ON "group_assignments"("round_id", "driver_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_assignments" ADD CONSTRAINT "group_assignments_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_assignments" ADD CONSTRAINT "group_assignments_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
