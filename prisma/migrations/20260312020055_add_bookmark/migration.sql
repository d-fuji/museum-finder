/*
  Warnings:

  - You are about to alter the column `comment` on the `Review` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1000)`.

*/
-- CreateEnum
CREATE TYPE "BookmarkStatus" AS ENUM ('WANT_TO_GO', 'VISITED');

-- AlterTable
ALTER TABLE "Museum" ALTER COLUMN "code" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "comment" SET DATA TYPE VARCHAR(1000);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" SERIAL NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "museumId" INTEGER NOT NULL,
    "status" "BookmarkStatus" NOT NULL,
    "visitedAt" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_museumId_idx" ON "Bookmark"("museumId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_museumId_key" ON "Bookmark"("userId", "museumId");

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_museumId_fkey" FOREIGN KEY ("museumId") REFERENCES "Museum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
