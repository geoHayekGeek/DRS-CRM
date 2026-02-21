-- CreateTable
CREATE TABLE "round_drivers" (
    "id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "round_drivers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "round_drivers_round_id_driver_id_key" ON "round_drivers"("round_id", "driver_id");

-- AddForeignKey
ALTER TABLE "round_drivers" ADD CONSTRAINT "round_drivers_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_drivers" ADD CONSTRAINT "round_drivers_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: create RoundDriver from existing GroupAssignments (preserves historical participation)
INSERT INTO "round_drivers" ("id", "round_id", "driver_id", "created_at")
SELECT gen_random_uuid(), "round_id", "driver_id", "created_at"
FROM "group_assignments"
ON CONFLICT ("round_id", "driver_id") DO NOTHING;

-- DropTable
DROP TABLE "championship_drivers";
