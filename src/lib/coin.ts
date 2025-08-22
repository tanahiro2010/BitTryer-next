import { prisma } from "@/data/prisma";
import { BaseCoin, CreateCoin } from "@/types/prisma";

class BitCoin {
    private coin: BaseCoin;

    static async get(coinId: string): Promise<BitCoin> {
        const coin = await prisma.coin.findFirst({
            where: {
                coin_id: coinId
            }
        });
        if (!coin) throw new Error("Coin not found");
        return new BitCoin(coin);
    }

    static async new(payload: CreateCoin): Promise<BitCoin> {
        const coin = await prisma.coin.create({
            data: payload
        });
        return new BitCoin(coin);
    }

    static async all(): Promise<BitCoin[]> {
        const coins = await prisma.coin.findMany();
        return await Promise.all(coins.map(async coin => await BitCoin.get(coin.coin_id)));
    }

    static async some(where: Record<keyof BaseCoin, any>): Promise<BitCoin[]> {
        const coins = await prisma.coin.findMany({
            where
        });

        return await Promise.all(coins.map(async coin => await BitCoin.get(coin.coin_id)));
    }

    private constructor(coin: BaseCoin) {
        this.coin = coin;
    }
}

export default BitCoin;