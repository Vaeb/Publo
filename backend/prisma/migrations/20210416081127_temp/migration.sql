/*
  Warnings:

  - The primary key for the `authors` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_AuthorToPublication" DROP CONSTRAINT "_AuthorToPublication_A_fkey";

-- AlterTable
ALTER TABLE "_AuthorToPublication" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "authors" DROP CONSTRAINT "authors_pkey",
ADD PRIMARY KEY ("lastName");

-- AddForeignKey
ALTER TABLE "_AuthorToPublication" ADD FOREIGN KEY ("A") REFERENCES "authors"("lastName") ON DELETE CASCADE ON UPDATE CASCADE;
