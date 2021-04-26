/*
  Warnings:

  - Added the required column `source` to the `publications` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "publications.doi_unique";

-- DropIndex
DROP INDEX "publications.title_unique";

-- AlterTable
ALTER TABLE "publications" ADD COLUMN     "publicationRootId" INTEGER,
ADD COLUMN     "source" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "publication_roots" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "doi" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "publication_roots.title_unique" ON "publication_roots"("title");

-- CreateIndex
CREATE UNIQUE INDEX "publication_roots.doi_unique" ON "publication_roots"("doi");

-- AddForeignKey
ALTER TABLE "publications" ADD FOREIGN KEY ("publicationRootId") REFERENCES "publication_roots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
