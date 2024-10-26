/*
  Warnings:

  - The values [Spotify,Youtube] on the enum `StreamType` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `provider` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('google', 'spotify');

-- AlterEnum
BEGIN;
CREATE TYPE "StreamType_new" AS ENUM ('spotify', 'youtube');
ALTER TABLE "Stream" ALTER COLUMN "type" TYPE "StreamType_new" USING ("type"::text::"StreamType_new");
ALTER TABLE "Space" ALTER COLUMN "type" TYPE "StreamType_new" USING ("type"::text::"StreamType_new");
ALTER TYPE "StreamType" RENAME TO "StreamType_old";
ALTER TYPE "StreamType_new" RENAME TO "StreamType";
DROP TYPE "StreamType_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "provider",
ADD COLUMN     "provider" "CredentialType" NOT NULL;

-- DropEnum
DROP TYPE "Provider";
