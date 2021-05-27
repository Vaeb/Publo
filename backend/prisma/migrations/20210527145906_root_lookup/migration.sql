/*
  Warnings:

  - A unique constraint covering the columns `[lookup]` on the table `publication_roots` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "publication_roots" ADD COLUMN     "lookup" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "publication_roots.lookup_unique" ON "publication_roots"("lookup");
