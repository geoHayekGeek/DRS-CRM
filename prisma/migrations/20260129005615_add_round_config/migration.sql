-- AlterTable
ALTER TABLE "rounds" ADD COLUMN     "available_karts" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "number_of_groups" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "setup_completed" BOOLEAN NOT NULL DEFAULT false;
