/*
  Warnings:

  - A unique constraint covering the columns `[source,lookup]` on the table `publications` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "authors.lookup_index" ON "authors"("lookup");

-- CreateIndex
CREATE UNIQUE INDEX "publications.source_lookup_unique" ON "publications"("source", "lookup");

-- CreateIndex
CREATE INDEX "venues.lookup_index" ON "venues"("lookup");
