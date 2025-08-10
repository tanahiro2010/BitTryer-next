import { CreateUser } from "@/types/prisma";
import { prisma } from "@/data/prisma";

class User {
    public userId: string | null = null;

    private constructor(userId?: string | null) {
        this.userId = userId || null;
    }

    static async createNewUser(payload: CreateUser) {
        const createdUser = await prisma.user.create({
            data: payload
        });
        this.userId = createdUser.client_id;
        return this;
    }

    static async getExistingUser(userId: string): Promise<User> {
        if (!userId) {
            throw new Error("User ID is required for existing users");
        }
        return new User(userId);
    }
}