/*
  Warnings:

  - A unique constraint covering the columns `[sourceId]` on the table `authors` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "authors" ADD COLUMN     "sourceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "authors.sourceId_unique" ON "authors"("sourceId");
