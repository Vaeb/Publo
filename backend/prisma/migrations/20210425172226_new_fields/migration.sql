/*
  Warnings:

  - You are about to drop the column `link` on the `publications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "publications" DROP COLUMN "link",
ADD COLUMN     "stampCreated" TIMESTAMP(3),
ADD COLUMN     "pdfUrl" TEXT,
ADD COLUMN     "pageUrl" TEXT;

-- AlterTable
ALTER TABLE "venues" ADD COLUMN     "issn" TEXT;
