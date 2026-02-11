-- CreateTable
CREATE TABLE "championship_drivers" (
    "id" TEXT NOT NULL,
    "championship_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "championship_drivers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "championship_drivers_championship_id_driver_id_key" ON "championship_drivers"("championship_id", "driver_id");

-- AddForeignKey
ALTER TABLE "championship_drivers" ADD CONSTRAINT "championship_drivers_championship_id_fkey" FOREIGN KEY ("championship_id") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "championship_drivers" ADD CONSTRAINT "championship_drivers_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
