import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/utils/token";
import { Decimal } from "@prisma/client/runtime/library";
import BitCoin from "@/lib/coin";
import User from "@/lib/user";


export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
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
    const [body, user] = await Promise.all([req.json(), User.current()]);
    if (!user) return NextResponse.json({ error: true, message: "Not authenticated", data: null }, { status: 401 });
    const { name, symbol, description, current_price } = body;
    if (!name || !symbol || !current_price) {
        return NextResponse.json({ error: true, message: "Missing required fields", data: null }, { status: 400 });
    }

    const coinId = await generateToken();

    const coin = await BitCoin.new({
        coin_id: coinId,
        name,
        symbol,
        initial_price: Decimal(current_price),
        current_price: Decimal(current_price),
        description,
        creator_id: user.userId
    }, user);
    if (!coin) return NextResponse.json({ error: true, message: "Failed to create coin", data: null }, { status: 500 });

    return NextResponse.json({ error: false, message: "Coin created successfully", data: { coin } });
}