/*
  Warnings:

  - Made the column `airdropType` on table `AirdropSignature` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AirdropSignature" ALTER COLUMN "airdropType" SET NOT NULL;
