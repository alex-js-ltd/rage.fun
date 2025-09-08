/*
  Warnings:

  - You are about to drop the column `airdropType` on the `AirdropSignature` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AirdropSignature" DROP COLUMN "airdropType";

-- DropEnum
DROP TYPE "AirdropType";
