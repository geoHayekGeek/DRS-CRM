-- CreateTable
CREATE TABLE "standings_overrides" (
    "id" TEXT NOT NULL,
    "championship_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "tie_key" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "standings_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "standings_overrides_championship_id_driver_id_tie_key_key" ON "standings_overrides"("championship_id", "driver_id", "tie_key");

-- AddForeignKey
ALTER TABLE "standings_overrides" ADD CONSTRAINT "standings_overrides_championship_id_fkey" FOREIGN KEY ("championship_id") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings_overrides" ADD CONSTRAINT "standings_overrides_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
