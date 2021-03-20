/*
  Warnings:

  - Added the required column `type` to the `Publication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Publication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL,
ADD COLUMN     "volume" TEXT;
