-- AlterTable
ALTER TABLE "Museum" ADD COLUMN     "admissionFee" INTEGER,
ADD COLUMN     "closedMessage" TEXT,
ADD COLUMN     "isClosed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "OperatingHours" (
    "id" SERIAL NOT NULL,
    "museumId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" VARCHAR(5) NOT NULL,
    "closeTime" VARCHAR(5) NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "note" VARCHAR(500),

    CONSTRAINT "OperatingHours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OperatingHours_museumId_idx" ON "OperatingHours"("museumId");

-- CreateIndex
CREATE UNIQUE INDEX "OperatingHours_museumId_dayOfWeek_key" ON "OperatingHours"("museumId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "OperatingHours" ADD CONSTRAINT "OperatingHours_museumId_fkey" FOREIGN KEY ("museumId") REFERENCES "Museum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
