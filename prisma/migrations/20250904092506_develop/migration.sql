-- DropForeignKey
ALTER TABLE "public"."coins" DROP CONSTRAINT "coins_creator_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."coins" ADD CONSTRAINT "coins_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("client_id") ON DELETE RESTRICT ON UPDATE CASCADE;
