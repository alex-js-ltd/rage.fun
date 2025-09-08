/*
  Warnings:

  - Made the column `thumbhash` on table `TokenMetadata` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TokenMetadata" ALTER COLUMN "thumbhash" SET NOT NULL;
