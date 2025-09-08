-- CreateEnum
CREATE TYPE "AirdropType" AS ENUM ('UNLOCK', 'RANDOM');

-- AlterTable
ALTER TABLE "AirdropSignature" ADD COLUMN     "airdropType" "AirdropType";
