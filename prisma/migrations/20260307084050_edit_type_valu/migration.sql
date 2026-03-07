/*
  Warnings:

  - The values [catch] on the enum `TradeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."TradeType_new" AS ENUM ('buy', 'sell', 'send', 'receive');
ALTER TABLE "public"."trade_histories" ALTER COLUMN "side" TYPE "public"."TradeType_new" USING ("side"::text::"public"."TradeType_new");
ALTER TYPE "public"."TradeType" RENAME TO "TradeType_old";
ALTER TYPE "public"."TradeType_new" RENAME TO "TradeType";
DROP TYPE "public"."TradeType_old";
COMMIT;
