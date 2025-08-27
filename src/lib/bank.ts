import { BasePortfolio } from "@/types/prisma";
import { DefaultArgs, Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/data/prisma";
import { Prisma } from "@prisma/client";
import User from "./user";

interface Query {
    select?: Prisma.PortfolioSelect<DefaultArgs> | null | undefined;
    omit?: Prisma.PortfolioOmit<DefaultArgs> | null | undefined;
    where?: Prisma.PortfolioWhereInput | undefined;
    orderBy?:
        | (
            | Prisma.PortfolioOrderByWithRelationInput
            | Prisma.PortfolioOrderByWithRelationInput[]
        )
        | undefined;
    cursor?: Prisma.PortfolioWhereUniqueInput | undefined;
    take?: number | undefined;
    skip?: number | undefined;
    distinct?:
        | (Prisma.PortfolioScalarFieldEnum | Prisma.PortfolioScalarFieldEnum[])
        | undefined;
}

/**
 * ポートフォリオ統計情報の型
 */
interface PortfolioStats {
    totalEntries: number;
    totalAmount: number;
    uniqueCoins: number;
    averageAmount: number;
}

const select = {
    id: true,
    user_id: true,
    coin_id: true,
    amount: true,
    createdAt: true,
    updatedAt: true,
} as const;


class Bank {
    public readonly userId: string;
    private readonly user: User;
    
    private constructor(user: User) {
        this.user = user;
        this.userId = user.userId;
    }

    // ==================== 静的メソッド ====================

    /**
     * Bankインスタンスを作成
     * @param userId ユーザーID
     * @returns Bankインスタンスまたはnull
     */
    static async get(userId: string): Promise<Bank | null> {
        try {
            const user = await User.get(userId);
            if (!user) {
                console.warn(`User not found: ${userId}`);
                return null;
            }
            return new Bank(user);
        } catch (error) {
            console.error(`Failed to create Bank instance for user ${userId}:`, error);
            return null;
        }
    }

    // ==================== 取得メソッド ====================

    /**
     * ポートフォリオ履歴を取得
     * @param options クエリオプション
     * @returns ポートフォリオ配列またはnull
     */
    async coins(options: Omit<Query, "where"> = {}): Promise<BasePortfolio[] | null> {
        try {
            const result = await prisma.portfolio.findMany({
                where: {
                    user_id: this.userId,
                },
                select,
                orderBy: { createdAt: 'desc' }, // デフォルトで新しい順
                ...options,
            });
            return result as BasePortfolio[];
        } catch (error) {
            console.error(`Failed to get portfolio histories for user ${this.userId}:`, error);
            return null;
        }
    }

    /**
     * ポートフォリオエントリ数を取得（最適化版）
     * @returns エントリ数またはnull
     */
    async length(): Promise<number | null> {
        try {
            const count = await prisma.portfolio.count({
                where: {
                    user_id: this.userId,
                },
            });
            return count;
        } catch (error) {
            console.error(`Failed to get portfolio count for user ${this.userId}:`, error);
            return null;
        }
    }

    /**
     * 特定のコインの保有量を取得
     * @param coinId コインID
     * @returns 保有量またはnull
     */
    async getCoinAmount(coinId: string): Promise<number | null> {
        try {
            const portfolios = await prisma.portfolio.findMany({
                where: {
                    user_id: this.userId,
                    coin_id: coinId,
                },
                select: { amount: true },
            });

            const totalAmount = portfolios.reduce((sum, p) => sum + Number(p.amount), 0);
            return totalAmount;
        } catch (error) {
            console.error(`Failed to get coin amount for ${coinId}:`, error);
            return null;
        }
    }

    /**
     * ポートフォリオ統計を取得
     * @returns 統計情報またはnull
     */
    async getStats(): Promise<PortfolioStats | null> {
        try {
            const portfolios = await this.coins({ select: { coin_id: true, amount: true } });
            if (!portfolios) return null;

            if (portfolios.length === 0) {
                return {
                    totalEntries: 0,
                    totalAmount: 0,
                    uniqueCoins: 0,
                    averageAmount: 0,
                };
            }

            const totalAmount = portfolios.reduce((sum, p) => sum + Number(p.amount), 0);
            const uniqueCoins = new Set(portfolios.map(p => p.coin_id)).size;
            const averageAmount = totalAmount / portfolios.length;

            return {
                totalEntries: portfolios.length,
                totalAmount,
                uniqueCoins,
                averageAmount,
            };
        } catch (error) {
            console.error(`Failed to get portfolio stats for user ${this.userId}:`, error);
            return null;
        }
    }

    // ==================== 更新メソッド ====================

    /**
     * ポートフォリオにコインを追加
     * @param coinId コインID
     * @param amount 追加量
     * @returns 作成されたポートフォリオエントリまたはnull
     */
    async add(coinId: string, amount: number): Promise<BasePortfolio | null> {
        try {
            if (amount <= 0) {
                console.error("Amount must be positive");
                return null;
            }

            const portfolio = await prisma.portfolio.create({
                data: {
                    user_id: this.userId,
                    coin_id: coinId,
                    amount: new Decimal(amount),
                },
                select,
            });
            
            return portfolio as BasePortfolio;
        } catch (error) {
            console.error(`Failed to add ${amount} of ${coinId} to portfolio:`, error);
            return null;
        }
    }

    /**
     * ポートフォリオからコインを削除
     * @param coinId コインID
     * @param amount 削除量（指定しない場合は全削除）
     * @returns 削除されたエントリ数またはnull
     */
    async remove(coinId: string, amount?: number): Promise<number | null> {
        try {
            if (amount !== undefined && amount <= 0) {
                console.error("Amount must be positive");
                return null;
            }

            if (amount === undefined) {
                // 全削除
                const result = await prisma.portfolio.deleteMany({
                    where: {
                        user_id: this.userId,
                        coin_id: coinId,
                    },
                });
                return result.count;
            } else {
                // 指定量削除（複雑なロジックのため、個別処理）
                const portfolios = await prisma.portfolio.findMany({
                    where: {
                        user_id: this.userId,
                        coin_id: coinId,
                    },
                    orderBy: { createdAt: 'asc' }, // 古い順で削除
                });

                let remainingToRemove = amount;
                let deletedCount = 0;

                for (const portfolio of portfolios) {
                    const portfolioAmount = Number(portfolio.amount);
                    
                    if (remainingToRemove >= portfolioAmount) {
                        // このエントリを完全削除
                        await prisma.portfolio.delete({
                            where: { id: portfolio.id },
                        });
                        remainingToRemove -= portfolioAmount;
                        deletedCount++;
                    } else {
                        // このエントリを部分削除
                        await prisma.portfolio.update({
                            where: { id: portfolio.id },
                            data: { amount: new Decimal(portfolioAmount - remainingToRemove) },
                        });
                        remainingToRemove = 0;
                        break;
                    }

                    if (remainingToRemove <= 0) break;
                }

                return deletedCount;
            }
        } catch (error) {
            console.error(`Failed to remove ${amount || 'all'} of ${coinId} from portfolio:`, error);
            return null;
        }
    }

    /**
     * ポートフォリオのコイン量を更新
     * @param coinId コインID
     * @param newAmount 新しい量
     * @returns 更新されたエントリ数またはnull
     */
    async update(coinId: string, newAmount: number): Promise<number | null> {
        try {
            if (newAmount < 0) {
                console.error("Amount cannot be negative");
                return null;
            }

            if (newAmount === 0) {
                // 0の場合は削除
                return await this.remove(coinId);
            }

            const result = await prisma.portfolio.updateMany({
                where: {
                    user_id: this.userId,
                    coin_id: coinId,
                },
                data: {
                    amount: new Decimal(newAmount),
                },
            });

            return result.count;
        } catch (error) {
            console.error(`Failed to update ${coinId} amount to ${newAmount}:`, error);
            return null;
        }
    }

    /**
     * ポートフォリオをクリア（全削除）
     * @returns 削除されたエントリ数またはnull
     */
    async clear(): Promise<number | null> {
        try {
            const result = await prisma.portfolio.deleteMany({
                where: {
                    user_id: this.userId,
                },
            });
            return result.count;
        } catch (error) {
            console.error(`Failed to clear portfolio for user ${this.userId}:`, error);
            return null;
        }
    }

    // ==================== ヘルパーメソッド ====================

    /**
     * 特定のコインを保有しているかチェック
     * @param coinId コインID
     * @returns 保有している場合true、エラー時null
     */
    async hasCoin(coinId: string): Promise<boolean | null> {
        try {
            const amount = await this.getCoinAmount(coinId);
            return amount !== null && amount > 0;
        } catch (error) {
            console.error(`Failed to check if user has coin ${coinId}:`, error);
            return null;
        }
    }

    /**
     * 保有している全コインIDのリストを取得
     * @returns コインIDの配列またはnull
     */
    async getCoinIds(): Promise<string[] | null> {
        try {
            const portfolios = await prisma.portfolio.findMany({
                where: {
                    user_id: this.userId,
                },
                select: { coin_id: true },
                distinct: ['coin_id'],
            });

            return portfolios.map(p => p.coin_id);
        } catch (error) {
            console.error(`Failed to get coin IDs for user ${this.userId}:`, error);
            return null;
        }
    }
}

export default Bank;
export type { PortfolioStats, Query };