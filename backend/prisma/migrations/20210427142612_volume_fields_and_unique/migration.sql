/*
  Warnings:

  - A unique constraint covering the columns `[source,title]` on the table `publications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[source,doi]` on the table `publications` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "publications" ADD COLUMN     "number" TEXT,
ADD COLUMN     "pages" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "publications.source_title_unique" ON "publications"("source", "title");

-- CreateIndex
CREATE UNIQUE INDEX "publications.source_doi_unique" ON "publications"("source", "doi");
