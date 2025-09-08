/*
  Warnings:

  - You are about to drop the column `signature` on the `AirdropEvent` table. All the data in the column will be lost.
  - You are about to drop the column `tokenId` on the `AirdropEvent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user,signatureId]` on the table `AirdropEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `signatureId` to the `AirdropEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AirdropEvent" DROP CONSTRAINT "AirdropEvent_tokenId_fkey";

-- DropIndex
DROP INDEX "AirdropEvent_tokenId_idx";

-- AlterTable
ALTER TABLE "AirdropEvent" DROP COLUMN "signature",
DROP COLUMN "tokenId",
ADD COLUMN     "signatureId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AirdropSignature" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokenId" TEXT NOT NULL,

    CONSTRAINT "AirdropSignature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AirdropSignature_tokenId_idx" ON "AirdropSignature"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "AirdropSignature_id_tokenId_key" ON "AirdropSignature"("id", "tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "AirdropEvent_user_signatureId_key" ON "AirdropEvent"("user", "signatureId");

-- AddForeignKey
ALTER TABLE "AirdropSignature" ADD CONSTRAINT "AirdropSignature_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "TokenMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirdropEvent" ADD CONSTRAINT "AirdropEvent_signatureId_fkey" FOREIGN KEY ("signatureId") REFERENCES "AirdropSignature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
