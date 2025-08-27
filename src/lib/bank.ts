import { BasePortfolio } from "@/types/prisma";
import { DefaultArgs } from "@prisma/client/runtime/library";
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


class Bank {
    private readonly user: User;
    private constructor(user: User) {
        this.user = user;
    }

    static async get(userId: string) {
        const user = await User.get(userId);
        if (!user) return null;

        return new Bank(user);
    }

    async histories(options: Omit<Query, "where"> = {}): Promise<Array<BasePortfolio> | null> {
        try {
            return await prisma.portfolio.findMany({
                where: {
                    user_id: this.user.userId,
                },
                ...options,
            });
        } catch {
            return null;
        }
    }

    async length(): Promise<number | null> {
        try {
            const count = await prisma.portfolio.findMany({
                where: {
                    user_id: this.user.userId,
                },
                select: { id: true }
            });
            return count.length;
        } catch {
            return null;
        }
    }

    async add(coinId: string, amount: number) {
        try {
            const portfolio = await prisma.portfolio.create({
                data: {
                    user_id: this.user.userId,
                    coin_id: coinId,
                    amount,
                },
            });
            return portfolio;
        } catch {
            return null;
        }
    }

    async remove(coinId: string) {
        try {
            const result = await prisma.portfolio.deleteMany({
                where: {
                    user_id: this.user.userId,
                    coin_id: coinId
                }
            });

            return result;
        } catch {
            return null;
        }
    }

    async update(coinId: string, amount: number) {
        try {
            const result = await prisma.portfolio.updateMany({
                where: {
                    user_id: this.user.userId,
                    coin_id: coinId
                },
                data: {
                    amount
                }
            });

            return result;
        } catch {
            return null;
        }
    }
}