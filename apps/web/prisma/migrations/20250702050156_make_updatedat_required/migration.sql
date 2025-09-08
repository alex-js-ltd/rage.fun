/*
  Warnings:

  - Made the column `updatedAt` on table `AirdropSignature` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AirdropSignature" ALTER COLUMN "updatedAt" SET NOT NULL;
