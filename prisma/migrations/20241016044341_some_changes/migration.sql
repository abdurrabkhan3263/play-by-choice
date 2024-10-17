/*
  Warnings:

  - A unique constraint covering the columns `[spaceId,streamId]` on the table `CurrentStream` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CurrentStream_spaceId_streamId_key" ON "CurrentStream"("spaceId", "streamId");
