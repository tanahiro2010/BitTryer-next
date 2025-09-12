/*
  Warnings:

  - You are about to drop the `TradeHistory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,coin_id]` on the table `portfolios` will be added. If there are existing duplicate values, this will fail.

*/
-- DropTable
DROP TABLE "public"."TradeHistory";

-- CreateTable
CREATE TABLE "public"."trade_histories" (
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

    CONSTRAINT "trade_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trade_histories_history_id_key" ON "public"."trade_histories"("history_id");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_user_id_coin_id_key" ON "public"."portfolios"("user_id", "coin_id");

-- AddForeignKey
ALTER TABLE "public"."portfolios" ADD CONSTRAINT "portfolios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."portfolios" ADD CONSTRAINT "portfolios_coin_id_fkey" FOREIGN KEY ("coin_id") REFERENCES "public"."coins"("coin_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trade_histories" ADD CONSTRAINT "trade_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trade_histories" ADD CONSTRAINT "trade_histories_coin_id_fkey" FOREIGN KEY ("coin_id") REFERENCES "public"."coins"("coin_id") ON DELETE CASCADE ON UPDATE CASCADE;
