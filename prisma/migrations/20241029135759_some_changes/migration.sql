/*
  Warnings:

  - Made the column `userId` on table `Upvote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `streamId` on table `Upvote` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Upvote" ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "streamId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "CurrentStream_streamId_idx" ON "CurrentStream"("streamId");

-- CreateIndex
CREATE INDEX "CurrentStream_spaceId_idx" ON "CurrentStream"("spaceId");

-- CreateIndex
CREATE INDEX "Stream_userId_idx" ON "Stream"("userId");

-- CreateIndex
CREATE INDEX "Stream_spaceId_idx" ON "Stream"("spaceId");

-- CreateIndex
CREATE INDEX "Stream_id_idx" ON "Stream"("id");

-- CreateIndex
CREATE INDEX "Upvote_userId_idx" ON "Upvote"("userId");

-- CreateIndex
CREATE INDEX "Upvote_streamId_idx" ON "Upvote"("streamId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");
