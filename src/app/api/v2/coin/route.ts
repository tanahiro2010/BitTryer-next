import { NextRequest, NextResponse } from "next/server";
import BitCoin from "@/lib/coin";

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
