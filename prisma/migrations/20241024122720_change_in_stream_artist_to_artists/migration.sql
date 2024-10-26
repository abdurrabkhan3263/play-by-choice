/*
  Warnings:

  - You are about to drop the column `artist` on the `Stream` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "artist",
ADD COLUMN     "artists" TEXT DEFAULT '';
