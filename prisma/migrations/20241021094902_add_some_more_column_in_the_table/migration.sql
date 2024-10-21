/*
  Warnings:

  - The values [Credential] on the enum `Provider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Provider_new" AS ENUM ('Google', 'Spotify');
ALTER TABLE "User" ALTER COLUMN "provider" TYPE "Provider_new" USING ("provider"::text::"Provider_new");
ALTER TYPE "Provider" RENAME TO "Provider_old";
ALTER TYPE "Provider_new" RENAME TO "Provider";
DROP TYPE "Provider_old";
COMMIT;

-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "artist" TEXT DEFAULT '',
ADD COLUMN     "duration" INTEGER DEFAULT 0;
