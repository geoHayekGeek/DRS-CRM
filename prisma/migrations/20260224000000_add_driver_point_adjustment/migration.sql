-- CreateTable
CREATE TABLE "driver_point_adjustments" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "round_id" TEXT,
    "championship_id" TEXT,
    "delta" INTEGER NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_point_adjustments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "driver_point_adjustments" ADD CONSTRAINT "driver_point_adjustments_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_point_adjustments" ADD CONSTRAINT "driver_point_adjustments_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_point_adjustments" ADD CONSTRAINT "driver_point_adjustments_championship_id_fkey" FOREIGN KEY ("championship_id") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
