import { BaseCoin, CreateCoin, TradeType } from "@/types/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/data/prisma";
import History from "./history";

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
type NumberFilter =
  | {
    equals?: number;
    in?: number[];
    notIn?: number[];
    lt?: number;
    lte?: number;
    gt?: number;
    gte?: number;
    not?: number | NumberFilter;
  }
  | number;

/**
 * ブール値フィールド用の検索条件
 */
type BooleanFilter =
  | {
    equals?: boolean;
    not?: boolean | BooleanFilter;
  }
  | boolean;

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
 * コイン検索条件の型定義
 */
type CoinWhereInput = Partial<{
  coin_id: StringFilter;
  name: StringFilter;
  symbol: StringFilter;
  description: StringFilter;
  creator_id: StringFilter;
  current_price: NumberFilter;
  market_cap: NumberFilter;
  rank: NumberFilter;
  is_active: BooleanFilter;
  is_tradeable: BooleanFilter;
  is_mineable: BooleanFilter;
  createdAt: DateTimeFilter;
  updatedAt: DateTimeFilter;
  AND?: CoinWhereInput[];
  OR?: CoinWhereInput[];
  NOT?: CoinWhereInput[];
}>;

const select = {
  id: true,
  coin_id: true,
  name: true,
  symbol: true,
  description: true,
  creator_id: true,
  total_supply: true,
  current_supply: true,
  initial_price: true,
  current_price: true,
  high_24h: true,
  low_24h: true,
  volume_24h: true,
  change_24h: true,
  change_24h_percent: true,
  market_cap: true,
  rank: true,
  is_active: true,
  is_tradeable: true,
  is_mineable: true,
  trading_fee: true,
  createdAt: true,
  updatedAt: true,
} as const;

class BitCoin {
  public readonly coinId: string;
  public readonly coin: Readonly<BaseCoin>;

  // ==================== コンストラクタ ====================

  private constructor(coin: BaseCoin) {
    this.coinId = coin.coin_id;
    this.coin = Object.freeze({ ...coin }); // immutableにする
  }

  // ==================== 静的メソッド（作成・取得） ====================

  /**
   * 新規コイン作成
   * @param payload コイン作成データ
   * @returns 作成されたBitCoinインスタンスまたはnull
   */
  static async new(payload: CreateCoin): Promise<BitCoin | null> {
    try {
      const createdCoin = await prisma.coin.create({
        data: payload,
      });

      return new BitCoin(createdCoin);
    } catch (error) {
      console.error(`Failed to create coin: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * コイン取得（ID指定）
   * @param coinId コインID
   * @returns BitCoinインスタンスまたはnull
   */
  static async get(coinId: string): Promise<BitCoin | null> {
    try {
      const coin = await prisma.coin.findFirst({
        where: {
          coin_id: coinId,
        },
        select,
      });

      if (!coin) return null;
      return new BitCoin(coin as BaseCoin);
    } catch (error) {
      console.error(`Failed to get coin: ${(error as Error).message}`);
      return null;
    }
  }

  // ==================== 静的メソッド（複数取得） ====================

  /**
   * 全コイン取得
   * @returns 全BitCoinインスタンスの配列（エラー時は空配列）
   */
  static async all(): Promise<BitCoin[]> {
    try {
      const coins = await prisma.coin.findMany({
        select,
        orderBy: { rank: "asc" }, // ランク順でソート
      });

      return coins.map((coin) => new BitCoin(coin as BaseCoin));
    } catch (error) {
      console.error(`Failed to get all coins: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * 条件検索でコイン取得（ページネーション対応）
   * @param where 検索条件
   * @param options 検索オプション
   * @returns 条件に一致するBitCoinインスタンスの配列
   */
  static async some(
    where: CoinWhereInput,
    options?: {
      limit?: number;
      page?: number;
      orderBy?: {
        field: keyof Pick<
          BaseCoin,
          "createdAt" | "updatedAt" | "name" | "rank" | "market_cap"
        >;
        direction: "asc" | "desc";
      };
    },
  ): Promise<BitCoin[]> {
    const { limit, page = 0, orderBy } = options || {};
    const take = limit || 20;
    const skip = page * take;

    try {
      if (!where || Object.keys(where).length === 0) {
        console.error("Search conditions are required");
        return [];
      }

      const orderByClause = orderBy
        ? { [orderBy.field]: orderBy.direction }
        : { rank: "asc" as const };

      const coins = await prisma.coin.findMany({
        where,
        select,
        take,
        skip,
        orderBy: orderByClause,
      });

      return coins.map((coin) => new BitCoin(coin as BaseCoin));
    } catch (error) {
      console.error(`Failed to search coins: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * 取引可能なコイン一覧を取得
   * @param limit 取得件数制限
   * @returns 取引可能なBitCoinインスタンスの配列（エラー時は空配列）
   */
  static async tradeable(limit?: number): Promise<BitCoin[]> {
    try {
      const coins = await prisma.coin.findMany({
        where: {
          is_tradeable: true,
          is_active: true,
        },
        select,
        take: limit,
        orderBy: { rank: "asc" },
      });

      return coins.map((coin) => new BitCoin(coin as BaseCoin));
    } catch (error) {
      console.error(`Failed to get tradeable coins: ${(error as Error).message}`);
      return [];
    }
  }

  // ==================== 価格変動機能（プライベートメソッド） ====================

  /**
   * 取引に基づいて価格を変動させる
   * @param tradeType 取引タイプ ('buy' | 'sell')
   * @param tradeAmount 取引量
   * @param tradePrice 取引価格
   * @returns 更新されたBitCoinインスタンスまたはnull
   */
  private async updatePriceByTrade(
    tradeType: "buy" | "sell",
    tradeAmount: number,
    tradePrice: number,
  ): Promise<BitCoin | null> {
    try {
      const newPriceData = this.calculatePriceChange(
        tradeType,
        tradeAmount,
        tradePrice,
      );

      const updatedCoin = await prisma.coin.update({
        where: { coin_id: this.coinId },
        data: newPriceData,
        select,
      });

      return new BitCoin(updatedCoin as BaseCoin);
    } catch (error) {
      console.error(`Failed to update coin price: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * 取引に基づく価格変動を計算
   * @param tradeType 取引タイプ ('buy' | 'sell')
   * @param tradeAmount 取引量
   * @param tradePrice 取引価格
   * @returns 更新すべきデータ
   */
  private calculatePriceChange(
    tradeType: "buy" | "sell",
    tradeAmount: number,
    tradePrice: number,
  ): Record<string, any> {
    const currentPrice = Number(this.coin.current_price);
    const currentSupply = Number(this.coin.current_supply);
    const totalSupply = Number(this.coin.total_supply);
    const marketCap = Number(this.coin.market_cap);

    // 取引量が総供給量に占める割合（影響度）
    const impactRatio = tradeAmount / currentSupply;

    // 基本変動率（0.1% ~ 5%の範囲）
    const baseVolatility = Math.min(Math.max(impactRatio * 100, 0.1), 5.0);

    // 価格変動率の計算
    let priceChangePercent: number;

    if (tradeType === "buy") {
      // 購入: 需要増加で価格上昇
      priceChangePercent = this.calculateBuyImpact(
        baseVolatility,
        currentSupply,
        totalSupply,
      );
    } else {
      // 売却: 供給増加で価格下落
      priceChangePercent = this.calculateSellImpact(
        baseVolatility,
        currentSupply,
        totalSupply,
      );
    }

    // 新しい価格を計算
    const priceChange = currentPrice * (priceChangePercent / 100);
    const newPrice = Math.max(currentPrice + priceChange, 0.01); // 最低価格を0.01に設定

    // 24時間の変動データを更新
    const change24h = newPrice - currentPrice;
    const changePercent24h = (change24h / currentPrice) * 100;

    // 新しい時価総額を計算
    const newMarketCap = newPrice * currentSupply;

    // 24時間の高値・安値を更新
    const currentHigh24h = Number(this.coin.high_24h);
    const currentLow24h = Number(this.coin.low_24h);
    const newHigh24h = Math.max(newPrice, currentHigh24h);
    const newLow24h = Math.min(newPrice, currentLow24h || newPrice);

    return {
      current_price: new Decimal(newPrice),
      change_24h: new Decimal(change24h),
      change_24h_percent: new Decimal(changePercent24h),
      market_cap: new Decimal(newMarketCap),
      high_24h: new Decimal(newHigh24h),
      low_24h: new Decimal(newLow24h),
      volume_24h: new Decimal(
        Number(this.coin.volume_24h) + (tradeAmount * tradePrice),
      ),
      updatedAt: new Date(),
    };
  }

  /**
   * 購入による価格上昇影響を計算
   * @param baseVolatility 基本変動率
   * @param currentSupply 現在の供給量
   * @param totalSupply 総供給量
   * @returns 価格変動率（正の値）
   */
  private calculateBuyImpact(
    baseVolatility: number,
    currentSupply: number,
    totalSupply: number,
  ): number {
    // 供給量が少ないほど価格上昇が大きい
    const scarcityMultiplier = 1 +
      ((totalSupply - currentSupply) / totalSupply) * 0.5;

    // ランダム要素を追加（±20%のバリエーション）
    const randomFactor = 0.8 + (Math.random() * 0.4);

    return baseVolatility * scarcityMultiplier * randomFactor;
  }

  /**
   * 売却による価格下落影響を計算
   * @param baseVolatility 基本変動率
   * @param currentSupply 現在の供給量
   * @param totalSupply 総供給量
   * @returns 価格変動率（負の値）
   */
  private calculateSellImpact(
    baseVolatility: number,
    currentSupply: number,
    totalSupply: number,
  ): number {
    // 供給量が多いほど価格下落が大きい
    const oversupplyMultiplier = 1 + (currentSupply / totalSupply) * 0.3;

    // ランダム要素を追加（±20%のバリエーション）
    const randomFactor = 0.8 + (Math.random() * 0.4);

    return -baseVolatility * oversupplyMultiplier * randomFactor;
  }

  /**
   * 大量取引による価格衝撃を計算
   * @param tradeAmount 取引量
   * @param averageVolume 平均取引量
   * @returns 衝撃係数（1.0以上）
   */
  private calculateMarketImpact(
    tradeAmount: number,
    averageVolume: number,
  ): number {
    const volumeRatio = tradeAmount / Math.max(averageVolume, 1);

    if (volumeRatio > 10) return 3.0; // 大量取引: 3倍の影響
    if (volumeRatio > 5) return 2.0; // 中量取引: 2倍の影響
    if (volumeRatio > 2) return 1.5; // 小量取引: 1.5倍の影響

    return 1.0; // 通常取引: 通常の影響
  }

  // ==================== 公開メソッド（取引・更新） ====================

  /**
   * コインを購入する
   * @param buyerId 購入者のユーザーID
   * @param amount 購入量
   * @param pricePerCoin 1コインあたりの購入価格
   * @returns 更新されたBitCoinインスタンスと取引履歴、またはnull
   */
  async buy(
    buyerId: string,
    amount: number,
    pricePerCoin?: number,
  ): Promise<{ coin: BitCoin; history: History } | null> {
    try {
      if (amount <= 0) {
        console.error("Purchase amount must be positive");
        return null;
      }

      if (!this.coin.is_tradeable || !this.coin.is_active) {
        console.error("This coin is not tradeable");
        return null;
      }

      const currentPrice = Number(this.coin.current_price);
      const actualPrice = pricePerCoin || currentPrice;
      const totalCost = amount * actualPrice;

      // 取引履歴を記録
      const tradeHistory = await this.recordTradeHistory(buyerId, amount, actualPrice, "buy");
      if (!tradeHistory) {
        console.error("Failed to record trade history");
        return null;
      }

      // 価格を更新
      const updatedCoin = await this.updatePriceByTrade(
        "buy",
        amount,
        actualPrice,
      );

      if (!updatedCoin) {
        console.error("Failed to update coin price");
        return null;
      }

      return { coin: updatedCoin, history: tradeHistory };
    } catch (error) {
      console.error(`Failed to buy coin: ${(error as Error).message}`);
      return null;
    }
  }

    /**
   * コインを売却する
   * @param sellerId 売却者のユーザーID
   * @param amount 売却量
   * @param pricePerCoin 1コインあたりの売却価格
   * @returns 更新されたBitCoinインスタンスと取引履歴、またはnull
   */
  async sell(
    sellerId: string,
    amount: number,
    pricePerCoin?: number,
  ): Promise<{ coin: BitCoin; history: History } | null> {
    try {
      if (amount <= 0) {
        console.error("Sell amount must be positive");
        return null;
      }

      if (!this.coin.is_tradeable || !this.coin.is_active) {
        console.error("This coin is not tradeable");
        return null;
      }

      const currentPrice = Number(this.coin.current_price);
      const actualPrice = pricePerCoin || currentPrice;

      // 取引履歴を記録
      const tradeHistory = await this.recordTradeHistory(sellerId, amount, actualPrice, "sell");
      if (!tradeHistory) {
        console.error("Failed to record trade history");
        return null;
      }

      // 価格を更新
      const updatedCoin = await this.updatePriceByTrade(
        "sell",
        amount,
        actualPrice,
      );

      if (!updatedCoin) {
        console.error("Failed to update coin price");
        return null;
      }

      return { coin: updatedCoin, history: tradeHistory };
    } catch (error) {
      console.error(`Failed to sell coin: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * コイン情報を更新する
   * @param updateData 更新するデータ
   * @returns 更新されたBitCoinインスタンスまたはnull
   */
  async update(
    updateData: Partial<
      Pick<
        BaseCoin,
        | "description"
        | "current_price"
        | "high_24h"
        | "low_24h"
        | "volume_24h"
        | "change_24h"
        | "change_24h_percent"
        | "market_cap"
        | "rank"
        | "is_active"
        | "is_tradeable"
      >
    >,
  ): Promise<BitCoin | null> {
    try {
      const updatedCoin = await prisma.coin.update({
        where: { coin_id: this.coinId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        select,
      });

      return new BitCoin(updatedCoin as BaseCoin);
    } catch (error) {
      console.error(`Failed to update coin: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * コインの取引を一時停止/再開する
   * @param tradeable 取引可能かどうか
   * @returns 更新されたBitCoinインスタンスまたはnull
   */
  async setTradeable(tradeable: boolean): Promise<BitCoin | null> {
    return await this.update({ is_tradeable: tradeable });
  }

  /**
   * コインをアクティブ/非アクティブにする
   * @param active アクティブかどうか
   * @returns 更新されたBitCoinインスタンスまたはnull
   */
  async setActive(active: boolean): Promise<BitCoin | null> {
    return await this.update({ is_active: active });
  }

  /**
   * コインのランクを更新する
   * @param rank 新しいランク
   * @returns 更新されたBitCoinインスタンスまたはnull
   */
  async updateRank(rank: number): Promise<BitCoin | null> {
    return await this.update({ rank });
  }

  /**
   * コインの説明を更新する
   * @param description 新しい説明
   * @returns 更新されたBitCoinインスタンスまたはnull
   */
  async updateDescription(description: string): Promise<BitCoin | null> {
    return await this.update({ description });
  }

  /**
   * 手動で価格を設定する（管理者用）
   * @param newPrice 新しい価格
   * @returns 更新されたBitCoinインスタンスまたはnull
   */
  async setPrice(newPrice: number): Promise<BitCoin | null> {
    try {
      if (newPrice <= 0) {
        console.error("Price must be positive");
        return null;
      }

      const currentPrice = Number(this.coin.current_price);
      const currentSupply = Number(this.coin.current_supply);
      const change24h = newPrice - currentPrice;
      const changePercent24h = (change24h / currentPrice) * 100;
      const newMarketCap = newPrice * currentSupply;

      // 24時間の高値・安値を更新
      const currentHigh24h = Number(this.coin.high_24h);
      const currentLow24h = Number(this.coin.low_24h);
      const newHigh24h = Math.max(newPrice, currentHigh24h);
      const newLow24h = Math.min(newPrice, currentLow24h || newPrice);

      return await this.update({
        current_price: new Decimal(newPrice),
        change_24h: new Decimal(change24h),
        change_24h_percent: new Decimal(changePercent24h),
        market_cap: new Decimal(newMarketCap),
        high_24h: new Decimal(newHigh24h),
        low_24h: new Decimal(newLow24h),
      });
    } catch (error) {
      console.error(`Failed to set price: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * 24時間統計をリセットする（日次バッチ処理用）
   * @returns 更新されたBitCoinインスタンスまたはnull
   */
  async reset24hStats(): Promise<BitCoin | null> {
    const currentPrice = Number(this.coin.current_price);

    return await this.update({
      high_24h: new Decimal(currentPrice),
      low_24h: new Decimal(currentPrice),
      volume_24h: new Decimal(0),
      change_24h: new Decimal(0),
      change_24h_percent: new Decimal(0),
    });
  }

  // ==================== ヘルパーメソッド ====================

  /**
   * 取引履歴を記録する
   * @param userId ユーザーID
   * @param amount 取引量
   * @param price 取引価格
   * @param side 取引種別
   * @returns 作成された取引履歴またはnull
   */
  private async recordTradeHistory(
    userId: string,
    amount: number,
    price: number,
    side: "buy" | "sell",
  ): Promise<History | null> {
    try {
      const tradeType = side === "buy" ? TradeType.BUY : TradeType.SELL;
      
      const history = await History.new({
        user_id: userId,
        coin_id: this.coinId,
        amount,
        price,
        side: tradeType,
      });

      return history;
    } catch (error) {
      console.error("Failed to record trade history:", error);
      return null;
    }
  }

  /**
   * 現在の価格情報を取得
   * @returns 価格情報オブジェクト
   */
  getPriceInfo(): {
    current: number;
    change24h: number;
    changePercent24h: number;
    high24h: number;
    low24h: number;
    volume24h: number;
    marketCap: number;
  } {
    return {
      current: Number(this.coin.current_price),
      change24h: Number(this.coin.change_24h),
      changePercent24h: Number(this.coin.change_24h_percent),
      high24h: Number(this.coin.high_24h),
      low24h: Number(this.coin.low_24h),
      volume24h: Number(this.coin.volume_24h),
      marketCap: Number(this.coin.market_cap),
    };
  }

  /**
   * コインの基本情報を取得
   * @returns 基本情報オブジェクト
   */
  getBasicInfo(): {
    coinId: string;
    name: string;
    symbol: string;
    description: string | null;
    creatorId: string;
    totalSupply: number;
    currentSupply: number;
    isActive: boolean;
    isTradeable: boolean;
    rank: number | null;
  } {
    return {
      coinId: this.coin.coin_id,
      name: this.coin.name,
      symbol: this.coin.symbol,
      description: this.coin.description,
      creatorId: this.coin.creator_id,
      totalSupply: Number(this.coin.total_supply),
      currentSupply: Number(this.coin.current_supply),
      isActive: this.coin.is_active,
      isTradeable: this.coin.is_tradeable,
      rank: this.coin.rank,
    };
  }
}

export default BitCoin;
export type { CoinWhereInput };
