-- Run this on Railway when migrations were marked applied but SQL never ran.
-- Fixes: tracks.layout_image_url, track_images, round_images.
-- Safe to run multiple times (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).

-- 1) tracks.layout_image_url
ALTER TABLE "tracks" ADD COLUMN IF NOT EXISTS "layout_image_url" TEXT;

-- 2) track_images table (from 20260129205908_add_track_media)
CREATE TABLE IF NOT EXISTS "track_images" (
    "id" TEXT NOT NULL,
    "track_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "track_images_pkey" PRIMARY KEY ("id")
);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'track_images_track_id_fkey'
  ) THEN
    ALTER TABLE "track_images" ADD CONSTRAINT "track_images_track_id_fkey"
      FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 3) round_images table (required by Round model)
CREATE TABLE IF NOT EXISTS "round_images" (
    "id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "round_images_pkey" PRIMARY KEY ("id")
);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'round_images_round_id_fkey'
  ) THEN
    ALTER TABLE "round_images" ADD CONSTRAINT "round_images_round_id_fkey"
      FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
