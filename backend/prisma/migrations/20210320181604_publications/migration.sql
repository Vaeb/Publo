/*
  Warnings:

  - You are about to drop the `Publication` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Publication";

-- CreateTable
CREATE TABLE "publications" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "volume" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "publications.title_unique" ON "publications"("title");
