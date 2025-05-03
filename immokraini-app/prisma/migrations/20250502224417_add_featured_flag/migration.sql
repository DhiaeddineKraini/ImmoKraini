-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "beds" INTEGER,
    "baths" INTEGER,
    "area" INTEGER,
    "description" TEXT,
    "propertyType" TEXT,
    "yearBuilt" INTEGER,
    "imageUrl" TEXT,
    "galleryImages" TEXT,
    "videoUrl" TEXT,
    "features" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "agentId" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Property_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("address", "agentId", "area", "baths", "beds", "createdAt", "description", "features", "galleryImages", "id", "imageUrl", "latitude", "longitude", "price", "propertyType", "slug", "title", "updatedAt", "videoUrl", "yearBuilt") SELECT "address", "agentId", "area", "baths", "beds", "createdAt", "description", "features", "galleryImages", "id", "imageUrl", "latitude", "longitude", "price", "propertyType", "slug", "title", "updatedAt", "videoUrl", "yearBuilt" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");
CREATE INDEX "Property_agentId_idx" ON "Property"("agentId");
CREATE INDEX "Property_isFeatured_idx" ON "Property"("isFeatured");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
