/*
  Warnings:

  - A unique constraint covering the columns `[firstName,lastName]` on the table `authors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "author_firstname_lastname_key" ON "authors"("firstName", "lastName");
