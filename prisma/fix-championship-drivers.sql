-- Run this on production if championship_drivers was marked "applied" but never created
-- (e.g. after baseline). Safe to run: ignores errors if table already exists.

CREATE TABLE IF NOT EXISTS "championship_drivers" (
    "id" TEXT NOT NULL,
    "championship_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "championship_drivers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "championship_drivers_championship_id_driver_id_key"
  ON "championship_drivers"("championship_id", "driver_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'championship_drivers_championship_id_fkey'
  ) THEN
    ALTER TABLE "championship_drivers"
      ADD CONSTRAINT "championship_drivers_championship_id_fkey"
      FOREIGN KEY ("championship_id") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'championship_drivers_driver_id_fkey'
  ) THEN
    ALTER TABLE "championship_drivers"
      ADD CONSTRAINT "championship_drivers_driver_id_fkey"
      FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
