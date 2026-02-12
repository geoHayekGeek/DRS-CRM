-- Run this on Railway DB if tracks.layout_image_url is missing
-- (migration was marked applied but SQL never ran)

-- Add column to tracks (safe if already exists in PG 9.5+)
ALTER TABLE "tracks" ADD COLUMN IF NOT EXISTS "layout_image_url" TEXT;

-- If you get errors about track_images table, run this too:
-- CREATE TABLE IF NOT EXISTS "track_images" (
--     "id" TEXT NOT NULL,
--     "track_id" TEXT NOT NULL,
--     "image_url" TEXT NOT NULL,
--     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     CONSTRAINT "track_images_pkey" PRIMARY KEY ("id")
-- );
-- ALTER TABLE "track_images" DROP CONSTRAINT IF EXISTS "track_images_track_id_fkey";
-- ALTER TABLE "track_images" ADD CONSTRAINT "track_images_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
