import { NextRequest, NextResponse } from "next/server";
import BitCoin from "@/lib/coin";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const page = parseInt(searchParams.get("page") ?? "0");
    try {
        const coins = await BitCoin.some({}, { limit, page });
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
