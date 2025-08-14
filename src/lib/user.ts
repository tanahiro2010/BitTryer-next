import { hashPassword, verifyPassword } from "@/utils/encode";
import { BaseSession, CreateUser } from "@/types/prisma";
import { generateToken } from "@/utils/token";
import { BaseUser } from "@/types/prisma";
import { cookies } from "next/headers";
import { prisma } from "@/data/prisma";

interface User {
  userId: Readonly<string>;
  user: Readonly<BaseUser>;
}

class User implements User {
  // public userId: Readonly<string>;
  // public user: Readonly<BaseUser>;

  private constructor(user: BaseUser) {
    this.userId = user.client_id;
    this.user = user;
  }

  static async new(payload: CreateUser): Promise<User> {
    payload["password"] = await hashPassword(payload["password"]);
    const createdUser = await prisma.user.create({
      data: payload,
    });
    return new User(createdUser);
  }

  static async get(
    userId: string | null,
    email?: string,
  ): Promise<User | null> {
    if (!userId && !email) {
      throw new Error("User ID or email is required for existing users");
    }
    const result = await prisma.user.findFirst({
      where: {
        client_id: userId || undefined,
        email: email || undefined,
      },
    });

    if (!result) return null;
    return new User(result);
  }

  static async current(token?: string): Promise<User | null> {
    const cookieStore = await cookies();
    const sToken = token || cookieStore.get("s-token")?.value;
    if (!sToken) return null;

    const session = await prisma.session.findFirst({
      where: {
        token: sToken,
      },
    });
    if (!session) return null;

    return await User.get(session.user_id);
  }

  async getSessions(): Promise<BaseSession[]> {
    const sessions = await prisma.session.findMany({
      where: {
        user_id: this.userId,
      },
    });

    return sessions;
  }

  async login(password: string): Promise<BaseSession> {
    const isValid = await verifyPassword(password, this.user.password);
    if (!isValid) throw new Error("Invalid password");

    const session = await prisma.session.create({
      data: {
        user_id: this.userId,
        token: await generateToken(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日間有効
      },
    });

    return session;
  }
}

export default User;
