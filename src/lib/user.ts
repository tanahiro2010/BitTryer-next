import { hashPassword, verifyPassword } from "@/utils/encode";
import { BaseSession, CreateUser } from "@/types/prisma";
import { generateToken } from "@/utils/token";
import { BaseUser } from "@/types/prisma";
import { cookies } from "next/headers";
import { prisma } from "@/data/prisma";

/**
 * ユーザー情報と認証機能を提供するインターフェース
 */
interface IUser {
  /** ユーザーID（読み取り専用） */
  readonly userId: string;
  /** ユーザー情報（読み取り専用） */
  readonly user: Readonly<BaseUser>;

  /** ユーザーのセッション一覧を取得 */
  getSessions(): Promise<BaseSession[]>;

  /** 期限切れセッションを削除 */
  cleanSessions(): Promise<void>;

  /** パスワード認証してログイン */
  login(password: string): Promise<BaseSession>;

  /** ログアウト処理 */
  logout(token?: string): Promise<void>;
}

class User implements IUser {
  public readonly userId: string;
  public readonly user: Readonly<BaseUser>;

  private constructor(user: BaseUser) {
    this.userId = user.client_id;
    this.user = Object.freeze({ ...user }); // immutableにする
  }

  static async new(payload: CreateUser): Promise<User> {
    payload["password"] = await hashPassword(payload["password"]);
    const createdUser = await prisma.user.create({
      data: payload,
    });
    return new User(createdUser);
  }

  static async get(userId: string | null, email?: string | null): Promise<User | null> {
    if (!userId && !email) {
      throw new Error("User ID or email is required for existing users");
    }
    const where: Partial<Record<keyof BaseUser, string | undefined>> = {};
    if (userId) where.client_id = userId;
    if (email) where.email = email;

    const result = await prisma.user.findFirst({
      where,
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

    const now = new Date();
    if (session.expires_at < now) {
      await prisma.session.delete({
        where: {
          token: sToken,
        },
      });
      return null;
    }

    return await User.get(session.user_id);
  }

  static async all(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users.map(user => new User(user));
  }

  static async some(where: Record<keyof BaseUser, any>): Promise<User[]> {
    const users = await prisma.user.findMany({
      where,
    });
    return users.map(user => new User(user));
  }

  async getSessions(): Promise<BaseSession[]> {
    const sessions = await prisma.session.findMany({
      where: {
        user_id: this.userId,
      },
    });

    return sessions;
  }

  async cleanSessions(): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        user_id: this.userId,
        expires_at: {
          lt: new Date(), // 現在時刻より前のセッションを削除
        }
      }
    });
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

  async logout(token?: string): Promise<void> {
    const cookieStore = await cookies();
    const sToken = token || cookieStore.get("s-token")?.value;
    if (!sToken) return;

    await prisma.session.deleteMany({
      where: {
        token: sToken,
      },
    });
  }
}

export default User;
