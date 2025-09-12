import { NextResponse, NextRequest } from "next/server";
import BitCoin from "@/lib/coin";
import User from "@/lib/user";
import { Decimal } from "@prisma/client/runtime/library";

interface Params {
    params: Promise<{ coin_id: string }>;
}

interface Payload {
    amount?: number;
    price?: number;
    type: "buy" | "sell";
}

type PromiseAllType = [{ coin_id: string }, User | null, Payload | null];


export async function POST(req: NextRequest, { params }: Params) {
    const [{ coin_id }, user, payload]: PromiseAllType = await Promise.all([params, User.current(), req.json()]);
    if (!user) {
        return NextResponse.json({ error: true, message: "Not authenticated", data: null }, { status: 401 });
    }
    
    if (!payload || !coin_id) {
        return NextResponse.json({ error: true, message: "Invalid request payload", data: null }, { status: 400 });
    }
    
    const coin = await BitCoin.get(coin_id);
    if (!coin) {
        return NextResponse.json({ error: true, message: "Coin not found", data: null }, { status: 404 });
    }

    const tradeType = payload.type.toLowerCase();
    switch (tradeType) {
        case "buy":
            if (!payload.amount) {
                return NextResponse.json({ error: true, message: "Amount is required for buy trades", data: null }, { status: 400 });
            }
            
            // 残高チェック
            const buyPrice = payload.price || Number(coin.coin.current_price);
            const buyCost = payload.amount * buyPrice;
            if (buyCost > Number(user.user.base_coin)) {
                return NextResponse.json({ error: true, message: "Insufficient funds", data: null }, { status: 400 });
            }
            
            try {
                // BitCoin.buyを直接呼び出し（Bank更新を含む）
                const result = await coin.buy(user.userId, payload.amount, payload.price);
                if (!result) {
                    return NextResponse.json({ error: true, message: "Failed to complete purchase", data: null }, { status: 500 });
                }

                // ユーザー残高を更新
                const newBalance = Number(user.user.base_coin) - buyCost;
                await user.update({ base_coin: new Decimal(newBalance) });

                return NextResponse.json({
                    error: false,
                    message: "Buy trade executed successfully",
                    data: { trade: result }
                });
            } catch (error) {
                console.error("Buy trade error:", error);
                return NextResponse.json({ 
                    error: true, 
                    message: "Failed to execute buy trade", 
                    data: null 
                }, { status: 500 });
            }
            
        case "sell":
            if (!payload.amount) {
                return NextResponse.json({ error: true, message: "Amount is required for sell trades", data: null }, { status: 400 });
            }
            
            try {
                // BitCoin.sellを直接呼び出し（Bank更新を含む）
                const result = await coin.sell(user.userId, payload.amount, payload.price);
                if (!result) {
                    return NextResponse.json({ error: true, message: "Failed to complete sale", data: null }, { status: 500 });
                }

                // ユーザー残高を更新（売却益を追加）
                const sellPrice = payload.price || Number(coin.coin.current_price);
                const sellProceeds = payload.amount * sellPrice;
                const newBalance = Number(user.user.base_coin) + sellProceeds;
                await user.update({ base_coin: new Decimal(newBalance) });

                return NextResponse.json({
                    error: false,
                    message: "Sell trade executed successfully",
                    data: { trade: result }
                });
            } catch (error) {
                console.error("Sell trade error:", error);
                return NextResponse.json({
                    error: true,
                    message: "Failed to execute sell trade",
                    data: null
                }, { status: 500 });
            }

        default:
            return NextResponse.json({ error: true, message: "Invalid trade type", data: null }, { status: 400 });
    }
}