/*
  Warnings:

  - A unique constraint covering the columns `[folderId]` on the table `SharedFolder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SharedFolder_folderId_key" ON "SharedFolder"("folderId");
