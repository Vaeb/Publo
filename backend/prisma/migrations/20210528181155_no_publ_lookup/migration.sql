/*
  Warnings:

  - You are about to drop the column `lookup` on the `publications` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "publications.source_lookup_unique";

-- AlterTable
ALTER TABLE "publications" DROP COLUMN "lookup";
