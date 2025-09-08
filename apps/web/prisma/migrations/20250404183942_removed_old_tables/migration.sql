/*
  Warnings:

  - You are about to drop the `RewardEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RewardSignature` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RewardEvent" DROP CONSTRAINT "RewardEvent_signatureId_fkey";

-- DropForeignKey
ALTER TABLE "RewardSignature" DROP CONSTRAINT "RewardSignature_tokenId_fkey";

-- DropTable
DROP TABLE "RewardEvent";

-- DropTable
DROP TABLE "RewardSignature";
