-- CreateTable
CREATE TABLE "BotWallet" (
    "id" TEXT NOT NULL,
    "secretKey" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotWallet_pkey" PRIMARY KEY ("id")
);
