-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_museumId_key" ON "Review"("userId", "museumId");
