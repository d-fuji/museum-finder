-- CreateEnum
CREATE TYPE "Category" AS ENUM ('CORPORATE', 'CITY_HISTORY');

-- CreateTable
CREATE TABLE "Museum" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" "Category" NOT NULL,
    "description" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" VARCHAR(500),
    "websiteUrl" VARCHAR(2048),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Museum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "userId" VARCHAR(255) NOT NULL,
    "museumId" UUID NOT NULL,
    "userName" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Museum_category_idx" ON "Museum"("category");

-- CreateIndex
CREATE INDEX "Review_museumId_idx" ON "Review"("museumId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_museumId_fkey" FOREIGN KEY ("museumId") REFERENCES "Museum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
