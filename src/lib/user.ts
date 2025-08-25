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

  // ==================== セッション管理メソッド ====================

  /** ユーザーのセッション一覧を取得 */
  getSessions(): Promise<BaseSession[]>;

  /** 期限切れセッションを削除 */
  cleanSessions(): Promise<void>;

  /** 全セッション削除 */
  deleteAllSessions(): Promise<void>;

  // ==================== 認証メソッド ====================

  /** パスワード認証してログイン */
  login(password: string): Promise<BaseSession>;

  /** ログアウト処理 */
  logout(token?: string): Promise<void>;

  // ==================== ユーザー情報更新メソッド ====================

  /** ユーザー情報更新 */
  update(payload: Partial<CreateUser>): Promise<User>;

  /** パスワードリセット */
  resetPassword(password: string): Promise<User>;
}

/**
 * 静的メソッド用のインターフェース（Userクラス用）
 */
interface IUserStatic {
  /** 新規ユーザー作成 */
  new (payload: CreateUser): Promise<User>;

  /** ユーザー取得（ID or メール） */
  get(userId: string | null, email?: string | null): Promise<User | null>;

  /** 現在のセッションからユーザー取得 */
  current(token?: string): Promise<User | null>;

  /** 全ユーザー取得 */
  all(): Promise<User[]>;

  /** 条件検索でユーザー取得 */
  some(where: Record<keyof BaseUser, any>): Promise<User[]>;
}

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
 * ユーザー検索条件の型定義
 */
type UserWhereInput = Partial<{
  client_id: StringFilter;
  email: StringFilter;
  name: StringFilter;
  createdAt: DateTimeFilter;
  updatedAt: DateTimeFilter;
  AND?: UserWhereInput[];
  OR?: UserWhereInput[];
  NOT?: UserWhereInput[];
}>;

const select = {
  client_id: true,
  email: true,
  description: true,
  password: true,
  base_coin: true,
  name: true,
  createdAt: true,
  updatedAt: true,
};

class User implements IUser {
  public readonly userId: string;
  public readonly user: Readonly<BaseUser>;

  // ==================== コンストラクタ ====================

  private constructor(user: BaseUser) {
    this.userId = user.client_id;
    this.user = Object.freeze({ ...user }); // immutableにする
  }

  // ==================== 静的メソッド（作成・取得） ====================

  /**
   * 新規ユーザー作成
   * @param payload ユーザー作成データ
   * @returns 作成されたUserインスタンス
   * @throws パスワードハッシュ化またはDB操作でエラーが発生した場合
   */
  static async new(payload: CreateUser): Promise<User> {
    try {
      // 元オブジェクトを変更せず新しいオブジェクトを作成
      const hashedPayload = {
        ...payload,
        password: await hashPassword(payload.password),
      };

      const createdUser = await prisma.user.create({
        data: hashedPayload,
      });

      return new User(createdUser);
    } catch (error) {
      throw new Error(`Failed to create user: ${(error as Error).message}`);
    }
  }

  /**
   * ユーザー取得（ID or メール）
   * @param userId ユーザーID
   * @param email メールアドレス
   * @returns Userインスタンスまたはnull
   * @throws 両方のパラメータがnullの場合
   */
  static async get(
    userId: string | null,
    email?: string | null,
  ): Promise<User | null> {
    if (!userId && !email) {
      throw new Error("User ID or email is required for existing users");
    }

    // 型安全なwhere条件の構築
    const where: UserWhereInput = {};
    if (userId) where.client_id = userId;
    if (email) where.email = email;

    try {
      const result = await prisma.user.findFirst({
        where,
        // 必要なフィールドのみ取得してパフォーマンス向上
        select,
      });

      if (!result) return null;
      return new User(result as BaseUser);
    } catch (error) {
      throw new Error(`Failed to get user: ${(error as Error).message}`);
    }
  }

  /**
   * 現在のセッションからユーザー取得
   * @param token セッショントークン（省略時はCookieから取得）
   * @returns Userインスタンスまたはnull
   */
  static async current(token?: string): Promise<User | null> {
    try {
      const cookieStore = await cookies();
      const sToken = token || cookieStore.get("s-token")?.value;
      if (!sToken) return null;

      // 有効期限チェックを含む効率的なクエリ
      const session = await prisma.session.findFirst({
        where: {
          token: sToken,
          expires_at: {
            gt: new Date(), // 有効期限内のセッションのみ
          },
        },
        select: { user_id: true },
      });

      if (!session) {
        // 期限切れセッションを削除
        await prisma.session.deleteMany({
          where: {
            token: sToken,
            expires_at: { lt: new Date() },
          },
        });
        return null;
      }

      return await User.get(session.user_id);
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  // ==================== 静的メソッド（複数取得） ====================

  /**
   * 全ユーザー取得
   * @returns 全Userインスタンスの配列
   */
  static async all(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        select,
      });

      return users.map((user) => new User(user as BaseUser));
    } catch (error) {
      throw new Error(`Failed to get all users: ${(error as Error).message}`);
    }
  }

  /**
   * 条件検索でユーザー取得
   * @param where 検索条件
   * @returns 条件に一致するUserインスタンスの配列
   */
  static async some(
    where: UserWhereInput,
    limit?: number,
    page: number = 0,
  ): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        where,
        select,
        take: limit,
        skip: page * (limit || 10), // ページネーション
      });

      return users.map((user) => new User(user as BaseUser));
    } catch (error) {
      throw new Error(`Failed to search users: ${(error as Error).message}`);
    }
  }

  // ==================== セッション管理メソッド ====================

  /**
   * ユーザーのセッション一覧を取得
   * @returns 有効なセッションの配列
   */
  async getSessions(): Promise<BaseSession[]> {
    try {
      const sessions = await prisma.session.findMany({
        where: {
          user_id: this.userId,
          expires_at: {
            gt: new Date(), // 有効なセッションのみ
          },
        },
        orderBy: { expires_at: "desc" },
      });

      return sessions;
    } catch (error) {
      throw new Error(`Failed to get sessions: ${(error as Error).message}`);
    }
  }

  /**
   * 期限切れセッションを削除
   */
  async cleanSessions(): Promise<void> {
    try {
      const deleteResult = await prisma.session.deleteMany({
        where: {
          user_id: this.userId,
          expires_at: {
            lt: new Date(), // 現在時刻より前のセッションを削除
          },
        },
      });

      console.log(
        `Cleaned ${deleteResult.count} expired sessions for user ${this.userId}`,
      );
    } catch (error) {
      throw new Error(`Failed to clean sessions: ${(error as Error).message}`);
    }
  }

  /**
   * 全セッション削除
   */
  async deleteAllSessions(): Promise<void> {
    try {
      const deleteResult = await prisma.session.deleteMany({
        where: {
          user_id: this.userId,
        },
      });

      console.log(
        `Deleted ${deleteResult.count} sessions for user ${this.userId}`,
      );
    } catch (error) {
      throw new Error(
        `Failed to delete all sessions: ${(error as Error).message}`,
      );
    }
  }

  // ==================== 認証メソッド ====================

  /**
   * パスワード認証してログイン
   * @param password 入力パスワード
   * @returns 作成されたセッション情報
   * @throws パスワードが間違っている場合
   */
  async login(password: string): Promise<BaseSession> {
    try {
      const isValid = await verifyPassword(password, this.user.password);
      if (!isValid) {
        throw new Error("Invalid password");
      }

      // 期限切れセッションのクリーンアップと現在のセッション取得
      const [_, sessions] = await Promise.all([
        this.cleanSessions(),
        this.getSessions(),
      ]);

      // セッション数制限（5個まで）
      if (sessions.length >= 5) {
        const oldestSession = sessions.sort(
          (a, b) => a.expires_at.getTime() - b.expires_at.getTime(),
        )[0];

        await prisma.session.delete({
          where: { token: oldestSession.token },
        });
      }

      const session = await prisma.session.create({
        data: {
          user_id: this.userId,
          token: await generateToken(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日間有効
        },
      });

      return session;
    } catch (error) {
      throw new Error(`Login failed: ${(error as Error).message}`);
    }
  }

  /**
   * ログアウト処理
   * @param token 削除するセッショントークン（省略時はCookieから取得）
   */
  async logout(token?: string): Promise<void> {
    try {
      if (token) {
        // 特定のトークンのみ削除（ユーザーIDでフィルタリング）
        await prisma.session.deleteMany({
          where: {
            user_id: this.userId,
            token: token,
          },
        });
      } else {
        // 全セッション削除
        await this.deleteAllSessions();
      }
    } catch (error) {
      throw new Error(`Logout failed: ${(error as Error).message}`);
    }
  }

  // ==================== ユーザー情報更新メソッド ====================

  /**
   * ユーザー情報更新
   * @param payload 更新データ
   * @returns 更新されたUserインスタンス
   */
  async update(payload: Partial<CreateUser>): Promise<User> {
    try {
      const updateData = { ...payload };
      console.log("Updating user:", updateData);

      // パスワードが含まれている場合はハッシュ化
      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      }

      const updatedUser = await prisma.user.update({
        where: {
          client_id: this.userId,
        },
        data: updateData,
      });

      return new User(updatedUser);
    } catch (error) {
      throw new Error(`Failed to update user: ${(error as Error).message}`);
    }
  }

  /**
   * パスワードリセット
   * @param password 新しいパスワード
   * @returns 更新されたUserインスタンス
   */
  async resetPassword(password: string): Promise<User> {
    return await this.update({ password });
  }
}

export default User;
export type { IUser, IUserStatic, UserWhereInput };
