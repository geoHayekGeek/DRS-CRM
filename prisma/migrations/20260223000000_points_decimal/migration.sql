-- AlterTable
ALTER TABLE "session_results" ALTER COLUMN "points" TYPE DOUBLE PRECISION USING "points"::double precision;
