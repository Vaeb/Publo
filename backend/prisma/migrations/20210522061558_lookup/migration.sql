/*
  Warnings:

  - The primary key for the `authors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_AuthorToPublication` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sourceId]` on the table `authors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[source,publicationRootId]` on the table `publications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lookup]` on the table `venues` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `A` on the `_AuthorToPublication` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `lookup` to the `authors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `publication_roots` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lookup` to the `publications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lookup` to the `venues` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_AuthorToPublication" DROP CONSTRAINT "_AuthorToPublication_A_fkey";

-- DropIndex
DROP INDEX "authors.id_unique";

-- AlterTable
ALTER TABLE "_AuthorToPublication" DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "authors" DROP CONSTRAINT "authors_pkey",
ADD COLUMN     "lookup" TEXT NOT NULL,
ADD PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "publication_roots" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "publications" ADD COLUMN     "lookup" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "venues" ADD COLUMN     "lookup" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "_AuthorToPublication_AB_unique" ON "_AuthorToPublication"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "authors.sourceId_unique" ON "authors"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "publications.source_publicationRootId_unique" ON "publications"("source", "publicationRootId");

-- CreateIndex
CREATE UNIQUE INDEX "venues.lookup_unique" ON "venues"("lookup");

-- AddForeignKey
ALTER TABLE "_AuthorToPublication" ADD FOREIGN KEY ("A") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
