/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `authors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "authors.id_unique" ON "authors"("id");
