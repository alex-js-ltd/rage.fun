/*
  Warnings:

  - Made the column `lamports` on table `SwapEvent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SwapEvent" ALTER COLUMN "lamports" SET NOT NULL;
