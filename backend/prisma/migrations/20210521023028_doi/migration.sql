-- AlterTable
ALTER TABLE "publication_roots" ALTER COLUMN "doi" DROP NOT NULL;

-- AlterTable
ALTER TABLE "publications" ALTER COLUMN "doi" DROP NOT NULL;
