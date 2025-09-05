import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/utils/token";
import { Decimal } from "@prisma/client/runtime/library";
import BitCoin from "@/lib/coin";
import User from "@/lib/user";


export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const page = parseInt(searchParams.get("page") ?? "0");
    const where = {};
    if (query) {
        Object.assign(where, {
            name: {
                contains: query,
                mode: "insensitive"
            }
        });
    }
    try {
        const coins = await BitCoin.some(where, { limit, page });
        return NextResponse.json({
            error: false,
            message: "Success fetching coins",
            data: { coins },
        });
    } catch (error) {
        console.error("Error fetching coins:", error);
        return NextResponse.json({
            error: true,
            message: "Failed to fetch coins",
            data: null,
        });
    }
}

export async function POST(req: NextRequest) {
    try {
        const [body, user, coinId] = await Promise.all([req.json(), User.current(), generateToken()]);
        if (!user) return NextResponse.json({ error: true, message: "Not authenticated", data: null }, { status: 401 });
        
        console.log("Current user:", { userId: user.userId, userObj: user.user });
        
        const { name, symbol, description, current_price } = body;
        console.log("Received data:", { name, symbol, description, current_price });
        
        if (!name || !symbol || !current_price) {
            return NextResponse.json({ error: true, message: "Missing required fields", data: null }, { status: 400 });
        }

        console.log("Generated coin ID:", coinId);

        const coinData = {
            coin_id: coinId,
            name,
            symbol,
            initial_price: new Decimal(current_price),
            current_price: new Decimal(current_price),
            description
        };
        console.log("Coin data to create:", coinData);

        const coin = await BitCoin.new(coinData, user);
        if (!coin) {
            console.error("BitCoin.new returned null");
            return NextResponse.json({ error: true, message: "Failed to create coin", data: null }, { status: 500 });
        }

        return NextResponse.json({ error: false, message: "Coin created successfully", data: { coin } });
    } catch (error) {
        console.error("Error in POST /api/v2/coins:", error);
        return NextResponse.json({ 
            error: true, 
            message: "Internal server error", 
            data: null,
            debug: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}