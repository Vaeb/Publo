/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[title]` on the table `Publication`. If there are existing duplicate values, the migration will fail.

*/
-- AlterTable
ALTER TABLE "Publication" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Publication.title_unique" ON "Publication"("title");
