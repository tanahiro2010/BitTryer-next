import { NextRequest, NextResponse } from "next/server";
import BitCoin from "@/lib/coin";
import User from "@/lib/user";

interface Params {
    params: Promise<{ coin_id: string }>;
}

// 共通レスポンス型
interface ApiResponse<T = any> {
    error: boolean;
    message: string;
    data: T | null;
}

// 共通レスポンス作成関数
function createResponse<T>(
    success: boolean,
    message: string,
    data: T | null = null,
    status: number = success ? 200 : 400
): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
        {
            error: !success,
            message,
            data,
        },
        { status }
    );
}

// 認証とコイン取得の共通処理
async function validateUserAndCoin(
    coinId: string,
    requireOwnership: boolean = false
): Promise<{ user: User | null; coin: BitCoin | null; error?: NextResponse }> {
    try {
        const [user, coin] = await Promise.all([
            User.current(),
            BitCoin.get(coinId)
        ]);

        if (!user) {
            return {
                user: null,
                coin: null,
                error: createResponse(false, "Not authenticated", null, 401)
            };
        }

        if (!coin) {
            return {
                user,
                coin: null,
                error: createResponse(false, "Coin not found", null, 404)
            };
        }

        if (requireOwnership && user.userId !== coin.coin.creator_id) {
            return {
                user,
                coin,
                error: createResponse(false, "You are not authorized to perform this action", null, 403)
            };
        }

        return { user, coin };
    } catch (error) {
        console.error("Error in validateUserAndCoin:", error);
        return {
            user: null,
            coin: null,
            error: createResponse(false, "Internal server error", null, 500)
        };
    }
}

export async function GET(_: NextRequest, { params }: Params) {
    try {
        const { coin_id } = await params;
        
        // コイン情報のみ取得（認証不要）
        const coin = await BitCoin.get(coin_id);
        if (!coin) {
            return createResponse(false, "Coin not found", null, 404);
        }

        return createResponse(true, "Success fetching coin", { coin });
    } catch (error) {
        console.error("Error fetching coin:", error);
        return createResponse(false, "Failed to fetch coin", null, 500);
    }
}

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        const { coin_id } = await params;
        
        // 認証とコイン所有権の検証
        const validation = await validateUserAndCoin(coin_id, true);
        if (validation.error) {
            return validation.error;
        }

        const { coin } = validation;
        
        // リクエストボディの検証
        let body;
        try {
            body = await req.json();
        } catch {
            return createResponse(false, "Invalid JSON in request body", null, 400);
        }

        const { description, rank } = body;

        // 入力値の検証
        if (description !== undefined && typeof description !== 'string') {
            return createResponse(false, "Description must be a string", null, 400);
        }
        
        if (rank !== undefined && (typeof rank !== 'number' || rank < 0)) {
            return createResponse(false, "Rank must be a non-negative number", null, 400);
        }

        // 更新データの準備（undefined値を除外）
        const updateData: { description?: string; rank?: number } = {};
        if (description !== undefined) updateData.description = description;
        if (rank !== undefined) updateData.rank = rank;

        if (Object.keys(updateData).length === 0) {
            return createResponse(false, "No valid fields to update", null, 400);
        }

        const updatedCoin = await coin!.update(updateData);

        return createResponse(true, "Coin updated successfully", { coin: updatedCoin });
    } catch (error) {
        console.error("Error updating coin:", error);
        return createResponse(false, "Failed to update coin", null, 500);
    }
}

export async function DELETE(_: NextRequest, { params }: Params) {
    try {
        const { coin_id } = await params;
        
        // 認証とコイン所有権の検証
        const validation = await validateUserAndCoin(coin_id, true);
        if (validation.error) {
            return validation.error;
        }

        const { coin } = validation;

        // 既に削除済みかチェック
        if (!coin!.coin.is_active) {
            return createResponse(false, "Coin is already deleted", null, 400);
        }

        // ソフトデリート（is_activeをfalseに）
        await coin!.update({ is_active: false });

        return createResponse(true, "Coin deleted successfully", null);
    } catch (error) {
        console.error("Error deleting coin:", error);
        return createResponse(false, "Failed to delete coin", null, 500);
    }
}
