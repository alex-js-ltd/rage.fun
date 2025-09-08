/*
  Warnings:

  - Made the column `amount` on table `SwapEvent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SwapEvent" ALTER COLUMN "amount" SET NOT NULL;
