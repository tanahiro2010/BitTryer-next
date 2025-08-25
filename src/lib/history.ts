import { prisma } from "@/data/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { BaseTradeHistory, TradeStatus, TradeType } from "@/types/prisma";

/**
 * 文字列フィールド用の検索条件
 */
type StringFilter =
    | {
        equals?: string;
        in?: string[];
        notIn?: string[];
        contains?: string;
        startsWith?: string;
        endsWith?: string;
        not?: string | StringFilter;
        mode?: "default" | "insensitive";
    }
    | string;

/**
 * 数値フィールド用の検索条件
 */
type DecimalFilter =
    | {
        equals?: Decimal;
        in?: Decimal[];
        notIn?: Decimal[];
        lt?: Decimal;
        lte?: Decimal;
        gt?: Decimal;
        gte?: Decimal;
        not?: Decimal | DecimalFilter;
    }
    | Decimal;

/**
 * 日付フィールド用の検索条件
 */
type DateTimeFilter =
    | {
        equals?: Date;
        in?: Date[];
        notIn?: Date[];
        lt?: Date;
        lte?: Date;
        gt?: Date;
        gte?: Date;
        not?: Date | DateTimeFilter;
    }
    | Date;

/**
 * 取引履歴検索条件の型定義
 */
type HistoryWhereInput = Partial<{
    history_id: StringFilter;
    user_id: StringFilter;
    coin_id: StringFilter;
    amount: DecimalFilter;
    price: DecimalFilter;
    side: TradeType;
    author_id: StringFilter;
    status: TradeStatus;
    createdAt: DateTimeFilter;
    updatedAt: DateTimeFilter;
    AND?: HistoryWhereInput[];
    OR?: HistoryWhereInput[];
    NOT?: HistoryWhereInput[];
}>;

const select = {
    id: true,
    history_id: true,
    user_id: true,
    coin_id: true,
    amount: true,
    price: true,
    side: true,
    author_id: true,
    status: true,
    createdAt: true,
    updatedAt: true,
} as const;

class History {
    public readonly historyId: string;
    public readonly history: Readonly<BaseTradeHistory>;

    // ==================== コンストラクタ ====================

    private constructor(history: BaseTradeHistory) {
        this.historyId = history.history_id;
        this.history = Object.freeze({ ...history }); // immutableにする
    }

    // ==================== 静的メソッド（作成・取得） ====================

    /**
     * 新規取引履歴作成
     * @param payload 取引履歴作成データ
     * @returns 作成されたHistoryインスタンス
     * @throws DB操作でエラーが発生した場合
     */
    static async new(payload: {
        user_id: string;
        coin_id: string;
        amount: number;
        price: number;
        side: TradeType;
        author_id?: string;
        status?: TradeStatus;
    }): Promise<History> {
        try {
            const createdHistory = await prisma.tradeHistory.create({
                data: {
                    user_id: payload.user_id,
                    coin_id: payload.coin_id,
                    amount: new Decimal(payload.amount),
                    price: new Decimal(payload.price),
                    side: payload.side,
                    author_id: payload.author_id,
                    status: payload.status || TradeStatus.COMPLETED,
                },
                select,
            });

            return new History(createdHistory as BaseTradeHistory);
        } catch (error) {
            throw new Error(
                `Failed to create history: ${(error as Error).message}`,
            );
        }
    }

    /**
     * 取引履歴取得（ID指定）
     * @param historyId 取引履歴ID
     * @returns Historyインスタンスまたはnull
     */
    static async get(historyId: string): Promise<History | null> {
        try {
            const history = await prisma.tradeHistory.findFirst({
                where: {
                    history_id: historyId,
                },
                select,
            });

            if (!history) return null;
            return new History(history as BaseTradeHistory);
        } catch (error) {
            throw new Error(
                `Failed to get history: ${(error as Error).message}`,
            );
        }
    }

    // ==================== 静的メソッド（複数取得） ====================

    /**
     * 全取引履歴取得
     * @returns 全Historyインスタンスの配列
     */
    static async all(): Promise<History[]> {
        try {
            const histories = await prisma.tradeHistory.findMany({
                select,
                orderBy: { createdAt: "desc" }, // 新しい順でソート
            });

            return histories.map((history) =>
                new History(history as BaseTradeHistory)
            );
        } catch (error) {
            throw new Error(
                `Failed to get all histories: ${(error as Error).message}`,
            );
        }
    }

    /**
     * 条件検索で取引履歴取得（ページネーション対応）
     * @param where 検索条件
     * @param options 検索オプション
     * @returns 条件に一致するHistoryインスタンスの配列
     */
    static async some(
        where: HistoryWhereInput,
        options?: {
            limit?: number;
            page?: number;
            orderBy?: {
                field: keyof Pick<
                    BaseTradeHistory,
                    "createdAt" | "updatedAt" | "amount" | "price"
                >;
                direction: "asc" | "desc";
            };
        },
    ): Promise<History[]> {
        const { limit, page = 0, orderBy } = options || {};
        const take = limit || 20;
        const skip = page * take;

        try {
            if (!where || Object.keys(where).length === 0) {
                throw new Error("Search conditions are required");
            }

            const orderByClause = orderBy
                ? { [orderBy.field]: orderBy.direction }
                : { createdAt: "desc" as const };

            const histories = await prisma.tradeHistory.findMany({
                where,
                select,
                take,
                skip,
                orderBy: orderByClause,
            });

            return histories.map((history) =>
                new History(history as BaseTradeHistory)
            );
        } catch (error) {
            throw new Error(
                `Failed to search histories: ${(error as Error).message}`,
            );
        }
    }

    /**
     * 検索条件に一致する取引履歴数を取得
     * @param where 検索条件
     * @returns 一致する取引履歴の総数
     */
    static async count(where: HistoryWhereInput): Promise<number> {
        try {
            if (!where || Object.keys(where).length === 0) {
                return await prisma.tradeHistory.count();
            }

            return await prisma.tradeHistory.count({ where });
        } catch (error) {
            throw new Error(
                `Failed to count histories: ${(error as Error).message}`,
            );
        }
    }

    /**
     * 特定ユーザーの取引履歴を取得
     * @param userId ユーザーID
     * @param limit 取得件数制限
     * @returns ユーザーのHistoryインスタンスの配列
     */
    static async byUser(userId: string, limit?: number): Promise<History[]> {
        try {
            const histories = await prisma.tradeHistory.findMany({
                where: {
                    user_id: userId,
                },
                select,
                take: limit,
                orderBy: { createdAt: "desc" },
            });

            return histories.map((history) =>
                new History(history as BaseTradeHistory)
            );
        } catch (error) {
            throw new Error(
                `Failed to get histories by user: ${(error as Error).message}`,
            );
        }
    }

    /**
     * 特定コインの取引履歴を取得
     * @param coinId コインID
     * @param limit 取得件数制限
     * @returns コインのHistoryインスタンスの配列
     */
    static async byCoin(coinId: string, limit?: number): Promise<History[]> {
        try {
            const histories = await prisma.tradeHistory.findMany({
                where: {
                    coin_id: coinId,
                },
                select,
                take: limit,
                orderBy: { createdAt: "desc" },
            });

            return histories.map((history) =>
                new History(history as BaseTradeHistory)
            );
        } catch (error) {
            throw new Error(
                `Failed to get histories by coin: ${(error as Error).message}`,
            );
        }
    }

    /**
     * 特定期間の取引履歴を取得
     * @param startDate 開始日時
     * @param endDate 終了日時
     * @param limit 取得件数制限
     * @returns 期間内のHistoryインスタンスの配列
     */
    static async byDateRange(
        startDate: Date,
        endDate: Date,
        limit?: number,
    ): Promise<History[]> {
        try {
            const histories = await prisma.tradeHistory.findMany({
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                select,
                take: limit,
                orderBy: { createdAt: "desc" },
            });

            return histories.map((history) =>
                new History(history as BaseTradeHistory)
            );
        } catch (error) {
            throw new Error(
                `Failed to get histories by date range: ${
                    (error as Error).message
                }`,
            );
        }
    }

    /**
     * 取引種別で取引履歴を取得
     * @param side 取引種別
     * @param limit 取得件数制限
     * @returns 取引種別のHistoryインスタンスの配列
     */
    static async bySide(side: TradeType, limit?: number): Promise<History[]> {
        try {
            const histories = await prisma.tradeHistory.findMany({
                where: {
                    side,
                },
                select,
                take: limit,
                orderBy: { createdAt: "desc" },
            });

            return histories.map((history) =>
                new History(history as BaseTradeHistory)
            );
        } catch (error) {
            throw new Error(
                `Failed to get histories by side: ${(error as Error).message}`,
            );
        }
    }

    /**
     * ステータス別で取引履歴を取得
     * @param status 取引ステータス
     * @param limit 取得件数制限
     * @returns ステータス別のHistoryインスタンスの配列
     */
    static async byStatus(
        status: TradeStatus,
        limit?: number,
    ): Promise<History[]> {
        try {
            const histories = await prisma.tradeHistory.findMany({
                where: {
                    status,
                },
                select,
                take: limit,
                orderBy: { createdAt: "desc" },
            });

            return histories.map((history) =>
                new History(history as BaseTradeHistory)
            );
        } catch (error) {
            throw new Error(
                `Failed to get histories by status: ${
                    (error as Error).message
                }`,
            );
        }
    }

    // ==================== 公開メソッド（更新） ====================

    /**
     * 取引履歴のステータスを更新
     * @param status 新しいステータス
     * @returns 更新されたHistoryインスタンス
     */
    async updateStatus(status: TradeStatus): Promise<History> {
        try {
            const updatedHistory = await prisma.tradeHistory.update({
                where: { history_id: this.historyId },
                data: {
                    status,
                    updatedAt: new Date(),
                },
                select,
            });

            return new History(updatedHistory as BaseTradeHistory);
        } catch (error) {
            throw new Error(
                `Failed to update history status: ${(error as Error).message}`,
            );
        }
    }

    /**
     * 取引をキャンセル（失敗ステータスに変更）
     * @returns 更新されたHistoryインスタンス
     */
    async cancel(): Promise<History> {
        return await this.updateStatus(TradeStatus.FAILED);
    }

    /**
     * 取引を完了（完了ステータスに変更）
     * @returns 更新されたHistoryインスタンス
     */
    async complete(): Promise<History> {
        return await this.updateStatus(TradeStatus.COMPLETED);
    }

    // ==================== 統計・集計メソッド ====================

    /**
     * ユーザーの取引統計を取得
     * @param userId ユーザーID
     * @param days 集計期間（日数）
     * @returns 取引統計
     */
    static async getUserStats(userId: string, days: number = 30): Promise<{
        totalTrades: number;
        totalVolume: number;
        buyCount: number;
        sellCount: number;
        avgTradeSize: number;
        totalSpent: number;
        totalEarned: number;
    }> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const histories = await prisma.tradeHistory.findMany({
                where: {
                    user_id: userId,
                    createdAt: { gte: startDate },
                    status: TradeStatus.COMPLETED,
                },
                select: {
                    amount: true,
                    price: true,
                    side: true,
                },
            });

            let totalVolume = 0;
            let buyCount = 0;
            let sellCount = 0;
            let totalSpent = 0;
            let totalEarned = 0;

            histories.forEach((history) => {
                const amount = Number(history.amount);
                const price = Number(history.price);
                const value = amount * price;

                totalVolume += value;

                if (history.side === TradeType.BUY) {
                    buyCount++;
                    totalSpent += value;
                } else if (history.side === TradeType.SELL) {
                    sellCount++;
                    totalEarned += value;
                }
            });

            return {
                totalTrades: histories.length,
                totalVolume,
                buyCount,
                sellCount,
                avgTradeSize: histories.length > 0
                    ? totalVolume / histories.length
                    : 0,
                totalSpent,
                totalEarned,
            };
        } catch (error) {
            throw new Error(
                `Failed to get user stats: ${(error as Error).message}`,
            );
        }
    }

    /**
     * コインの取引統計を取得
     * @param coinId コインID
     * @param days 集計期間（日数）
     * @returns コイン取引統計
     */
    static async getCoinStats(coinId: string, days: number = 30): Promise<{
        totalTrades: number;
        totalVolume: number;
        buyVolume: number;
        sellVolume: number;
        avgPrice: number;
        highPrice: number;
        lowPrice: number;
    }> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const histories = await prisma.tradeHistory.findMany({
                where: {
                    coin_id: coinId,
                    createdAt: { gte: startDate },
                    status: TradeStatus.COMPLETED,
                },
                select: {
                    amount: true,
                    price: true,
                    side: true,
                },
            });

            let totalVolume = 0;
            let buyVolume = 0;
            let sellVolume = 0;
            let totalPrice = 0;
            let highPrice = 0;
            let lowPrice = Number.MAX_VALUE;

            histories.forEach((history) => {
                const amount = Number(history.amount);
                const price = Number(history.price);
                const value = amount * price;

                totalVolume += value;
                totalPrice += price;

                if (price > highPrice) highPrice = price;
                if (price < lowPrice) lowPrice = price;

                if (history.side === TradeType.BUY) {
                    buyVolume += value;
                } else if (history.side === TradeType.SELL) {
                    sellVolume += value;
                }
            });

            return {
                totalTrades: histories.length,
                totalVolume,
                buyVolume,
                sellVolume,
                avgPrice: histories.length > 0
                    ? totalPrice / histories.length
                    : 0,
                highPrice: highPrice > 0 ? highPrice : 0,
                lowPrice: lowPrice !== Number.MAX_VALUE ? lowPrice : 0,
            };
        } catch (error) {
            throw new Error(
                `Failed to get coin stats: ${(error as Error).message}`,
            );
        }
    }

    // ==================== ヘルパーメソッド ====================

    /**
     * 取引情報を取得
     * @returns 取引情報オブジェクト
     */
    getTradeInfo(): {
        historyId: string;
        userId: string;
        coinId: string;
        amount: number;
        price: number;
        totalValue: number;
        side: TradeType;
        status: TradeStatus;
        authorId: string | null;
        createdAt: Date;
    } {
        const amount = Number(this.history.amount);
        const price = Number(this.history.price);

        return {
            historyId: this.history.history_id,
            userId: this.history.user_id,
            coinId: this.history.coin_id,
            amount,
            price,
            totalValue: amount * price,
            side: this.history.side,
            status: this.history.status,
            authorId: this.history.author_id,
            createdAt: this.history.createdAt,
        };
    }

    /**
     * 取引が完了しているかチェック
     * @returns 完了していればtrue
     */
    isCompleted(): boolean {
        return this.history.status === TradeStatus.COMPLETED;
    }

    /**
     * 取引が失敗しているかチェック
     * @returns 失敗していればtrue
     */
    isFailed(): boolean {
        return this.history.status === TradeStatus.FAILED;
    }

    /**
     * 取引がローディング中かチェック
     * @returns ローディング中ならtrue
     */
    isLoading(): boolean {
        return this.history.status === TradeStatus.LOADING;
    }
}

export default History;
export type { HistoryWhereInput };
