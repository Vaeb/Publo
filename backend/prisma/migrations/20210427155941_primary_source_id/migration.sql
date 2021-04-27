/*
  Warnings:

  - The primary key for the `authors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `sourceId` on table `authors` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_AuthorToPublication" DROP CONSTRAINT "_AuthorToPublication_A_fkey";

-- DropIndex
DROP INDEX "authors.sourceId_unique";

-- AlterTable
ALTER TABLE "authors" DROP CONSTRAINT "authors_pkey",
ALTER COLUMN "sourceId" SET NOT NULL,
ADD PRIMARY KEY ("sourceId");

-- AddForeignKey
ALTER TABLE "_AuthorToPublication" ADD FOREIGN KEY ("A") REFERENCES "authors"("sourceId") ON DELETE CASCADE ON UPDATE CASCADE;
