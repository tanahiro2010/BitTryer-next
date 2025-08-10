-- CreateEnum
CREATE TYPE "public"."TradeType" AS ENUM ('buy', 'sell', 'send', 'catch');

-- CreateEnum
CREATE TYPE "public"."TradeStatus" AS ENUM ('loading', 'completed', 'failed');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "slug" TEXT,
    "base_coin" DECIMAL(65,30) NOT NULL DEFAULT 100000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coins" (
    "id" TEXT NOT NULL,
    "coin_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "description" TEXT,
    "creator_id" TEXT NOT NULL,
    "total_supply" DECIMAL(65,30) NOT NULL DEFAULT 100000,
    "current_supply" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "initial_price" DECIMAL(65,30) NOT NULL DEFAULT 10,
    "current_price" DECIMAL(65,30) NOT NULL DEFAULT 10,
    "high_24h" DECIMAL(65,30) NOT NULL DEFAULT 10,
    "low_24h" DECIMAL(65,30) NOT NULL DEFAULT 10,
    "volume_24h" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "change_24h" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "change_24h_percent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "market_cap" DECIMAL(65,30) NOT NULL DEFAULT 1000000,
    "rank" INTEGER DEFAULT 999,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_tradeable" BOOLEAN NOT NULL DEFAULT true,
    "is_mineable" BOOLEAN NOT NULL DEFAULT false,
    "trading_fee" DECIMAL(65,30) NOT NULL DEFAULT 0.001,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."portfolios" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "coin_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TradeHistory" (
    "id" TEXT NOT NULL,
    "history_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "coin_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "side" "public"."TradeType" NOT NULL,
    "author_id" TEXT,
    "status" "public"."TradeStatus" NOT NULL DEFAULT 'loading',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_client_id_key" ON "public"."users"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_slug_key" ON "public"."users"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "public"."sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "coins_coin_id_key" ON "public"."coins"("coin_id");

-- CreateIndex
CREATE UNIQUE INDEX "coins_name_key" ON "public"."coins"("name");

-- CreateIndex
CREATE UNIQUE INDEX "coins_symbol_key" ON "public"."coins"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "TradeHistory_history_id_key" ON "public"."TradeHistory"("history_id");

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coins" ADD CONSTRAINT "coins_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
