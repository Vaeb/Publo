/*
  Warnings:

  - The primary key for the `authors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `fullName` to the `authors` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_AuthorToPublication" DROP CONSTRAINT "_AuthorToPublication_A_fkey";

-- DropIndex
DROP INDEX "authors.firstName_lastName_unique";

-- AlterTable
ALTER TABLE "authors" DROP CONSTRAINT "authors_pkey",
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD PRIMARY KEY ("fullName");

-- AddForeignKey
ALTER TABLE "_AuthorToPublication" ADD FOREIGN KEY ("A") REFERENCES "authors"("fullName") ON DELETE CASCADE ON UPDATE CASCADE;
