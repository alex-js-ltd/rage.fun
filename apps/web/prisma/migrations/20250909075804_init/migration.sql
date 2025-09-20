-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Funding', 'Complete', 'Migrated');

-- CreateEnum
CREATE TYPE "SwapType" AS ENUM ('Buy', 'Sell');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metadata" (
    "name" VARCHAR(32) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "description" VARCHAR(280) NOT NULL,
    "image" TEXT NOT NULL,
    "thumbhash" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tokenId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BondingCurve" (
    "id" TEXT NOT NULL,
    "connectorWeight" DECIMAL(65,30) NOT NULL,
    "decimals" INTEGER NOT NULL,
    "virtualSupply" BIGINT NOT NULL,
    "currentSupply" BIGINT NOT NULL,
    "targetSupply" BIGINT NOT NULL,
    "virtualReserve" BIGINT NOT NULL,
    "currentReserve" BIGINT NOT NULL,
    "targetReserve" BIGINT NOT NULL,
    "tradingFees" BIGINT NOT NULL,
    "openTime" BIGINT NOT NULL,
    "status" "Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tokenId" TEXT NOT NULL,

    CONSTRAINT "BondingCurve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwapEvent" (
    "id" TEXT NOT NULL,
    "signer" TEXT NOT NULL,
    "time" BIGINT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "tokenAmount" BIGINT NOT NULL,
    "swapType" "SwapType" NOT NULL,
    "lamports" BIGINT NOT NULL,
    "rentAmount" BIGINT NOT NULL,
    "tokenId" TEXT NOT NULL,

    CONSTRAINT "SwapEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" VARCHAR(280) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentCommentId" TEXT,
    "ownerId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HarvestEvent" (
    "id" TEXT NOT NULL,
    "signer" TEXT NOT NULL,
    "time" BIGINT NOT NULL,
    "lamports" BIGINT NOT NULL,
    "tokenId" TEXT NOT NULL,

    CONSTRAINT "HarvestEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotWallet" (
    "id" TEXT NOT NULL,
    "secretKey" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Token_creatorId_idx" ON "Token"("creatorId");

-- CreateIndex
CREATE INDEX "Token_creatorId_createdAt_idx" ON "Token"("creatorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Metadata_symbol_key" ON "Metadata"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Metadata_tokenId_key" ON "Metadata"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "BondingCurve_tokenId_key" ON "BondingCurve"("tokenId");

-- CreateIndex
CREATE INDEX "BondingCurve_tokenId_idx" ON "BondingCurve"("tokenId");

-- CreateIndex
CREATE INDEX "SwapEvent_tokenId_idx" ON "SwapEvent"("tokenId");

-- CreateIndex
CREATE INDEX "Comment_tokenId_idx" ON "Comment"("tokenId");

-- CreateIndex
CREATE INDEX "HarvestEvent_tokenId_idx" ON "HarvestEvent"("tokenId");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metadata" ADD CONSTRAINT "Metadata_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BondingCurve" ADD CONSTRAINT "BondingCurve_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapEvent" ADD CONSTRAINT "SwapEvent_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestEvent" ADD CONSTRAINT "HarvestEvent_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;
