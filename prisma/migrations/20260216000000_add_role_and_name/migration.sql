-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable: add name (nullable)
ALTER TABLE "admin_users" ADD COLUMN IF NOT EXISTS "name" TEXT;

-- AlterTable: add role with default
DO $$ BEGIN
  ALTER TABLE "admin_users" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'ADMIN';
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Set first admin as SUPER_ADMIN (by oldest created_at)
UPDATE "admin_users"
SET role = 'SUPER_ADMIN'
WHERE id = (
  SELECT id FROM "admin_users"
  ORDER BY created_at ASC
  LIMIT 1
);
