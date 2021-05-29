-- AlterIndex
ALTER INDEX "authors.lookup_index" RENAME TO "idx_gin_author_lookup";

-- AlterIndex
ALTER INDEX "venues.lookup_index" RENAME TO "idx_gin_venue_lookup";
