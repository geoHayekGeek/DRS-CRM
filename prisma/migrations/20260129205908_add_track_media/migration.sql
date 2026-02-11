-- AlterTable
ALTER TABLE "tracks" ADD COLUMN     "layout_image_url" TEXT;

-- CreateTable
CREATE TABLE "track_images" (
    "id" TEXT NOT NULL,
    "track_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "track_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "track_images" ADD CONSTRAINT "track_images_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
