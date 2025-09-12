import { BaseCoin, CreateCoin, TradeType } from "@/types/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/data/prisma";
import History from "./history";
import User from "./user";
import Bank from "./bank";

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

  // ==================== 取引手数料設定の定数 ====================
  static readonly TRADING_FEE_CONFIG = {
    SELL_FEE_MULTIPLIER: 10,        // 売却手数料倍率 (基本手数料の10倍)
    MINIMUM_SELL_FEE_RATE: 0.05,    // 最低売却手数料率 (5%)
    MINIMUM_SELL_FEE_AMOUNT: 0.1,   // 最低売却手数料額 (0.1コイン)
  } as const;

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
  static async new(payload: CreateCoin, user: User): Promise<BitCoin | null> {
    try {
      const price = payload.current_price;
      console.log(`Creating coin with price: ${price}, user balance: ${user.user.base_coin}`);
      
      if (price.toNumber() <= 0) {
        console.error("Price must be positive");
        return null;
      }
      
      // ユーザーの残高をチェック
      if (price.greaterThan(user.user.base_coin)) {
        console.error(`Insufficient balance. Required: ${price}, Available: ${user.user.base_coin}`);
        return null;
      }
      
      // ベースコインを引き出し（負の値で引き出し）
      await user.pullBaseCoin(-price.toNumber());

      const createdCoin = await prisma.coin.create({
        data: {
          ...payload,
          total_supply: new Decimal(1000000), // デフォルト総供給量
          current_supply: new Decimal(1000),  // 初期流通量1000（価格変動計算に使用）
          high_24h: payload.current_price,    // 24時間高値は現在価格
          low_24h: payload.current_price,     // 24時間安値は現在価格
          volume_24h: new Decimal(0),         // 初期取引量は0
          change_24h: new Decimal(0),         // 初期変動額は0
          change_24h_percent: new Decimal(0), // 初期変動率は0%
          market_cap: new Decimal(0),         // 初期時価総額は0
          rank: null,                         // 初期ランクはnull
          is_active: true,                    // デフォルトでアクティブ
          is_tradeable: true,                 // デフォルトで取引可能
          is_mineable: false,                 // デフォルトでマイニング不可
          trading_fee: new Decimal(0.005),    // デフォルト取引手数料0.5%
          creator_id: user.userId             // これは client_id と同じ
        },
      });

      console.log("Coin created successfully:", createdCoin.coin_id);
      return new BitCoin(createdCoin);
    } catch (error) {
      console.error(`Failed to create coin: ${(error as Error).message}`);
      console.error("Full error:", error);
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

      return coins.map((coin: BaseCoin) => new BitCoin(coin));
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
    const { limit, page = 1, orderBy } = options || {};
    const take = limit || 20;
    const skip = (page - 1) * take;

    try {
      // if (!where || Object.keys(where).length === 0) {
      //   console.error("Search conditions are required");
      //   return [];
      // }

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

      return coins.map((coin: BaseCoin) => new BitCoin(coin as BaseCoin));
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
  static async tradeable(limit?: number, page: number = 1): Promise<BitCoin[]> {
    try {
      const coins = await prisma.coin.findMany({
        where: {
          is_tradeable: true,
          is_active: true,
        },
        select,
        take: limit,
        skip: (page - 1) * (limit || 20),
        orderBy: { rank: "asc" },
      });

      return coins.map((coin: BaseCoin) => new BitCoin(coin));
    } catch (error) {
      console.error(`Failed to get tradeable coins: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * ユーザーが作成したコイン一覧を取得
   * @param creatorId ユーザーID
   * @param options 取得オプション（limit, page）
   */
  static async author(creatorId: string, options: { limit?: number; page?: number }): Promise<BitCoin[]> {
    const { limit = 20, page = 1 } = options;

    try {
      const coins = await prisma.coin.findMany({
        where: {
          creator_id: creatorId,
        },
        select,
        take: limit || 50,
        skip: (page - 1) * (limit || 20),
        orderBy: { createdAt: "desc" },
      });
      return coins.map((coin: BaseCoin) => new BitCoin(coin));
    } catch (error) {
      console.error(`Failed to get user's created coins: ${(error as Error).message}`);
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
    const currentSupply = Math.max(Number(this.coin.current_supply), 1); // 最小値1に設定
    const totalSupply = Number(this.coin.total_supply);
    const volume24h = Number(this.coin.volume_24h);

    // 取引量ベースの影響度計算（より積極的な変動）
    const baseImpact = Math.log(tradeAmount + 1) * 2; // 対数スケールで基本影響度
    const volumeImpact = tradeAmount / Math.max(volume24h / 24, 1); // 日平均取引量に対する比率
    
    // 取引量に応じた基本変動率（0.1%～2%の範囲に縮小）
    let baseVolatility: number;
    if (tradeAmount >= 20) {
      baseVolatility = Math.min(1.5 + (tradeAmount - 20) * 0.025, 2); // 大量取引: 1.5-2%
    } else if (tradeAmount >= 10) {
      baseVolatility = 0.8 + (tradeAmount - 10) * 0.07; // 中量取引: 0.8-1.5%
    } else if (tradeAmount >= 5) {
      baseVolatility = 0.4 + (tradeAmount - 5) * 0.08; // 小量取引: 0.4-0.8%
    } else {
      baseVolatility = 0.1 + tradeAmount * 0.06; // 極小取引: 0.1-0.4%
    }

    // 市場状況による補正（変動をさらに抑制）
    const liquidityFactor = Math.min(totalSupply / 300000, 1.2); // 流動性係数をさらに低下
    const scarcityFactor = Math.max(1 - (currentSupply / totalSupply), 0.5); // 希少性の影響をさらに制限
    
    // 最終的な変動率を計算（基本の40-50%に抑制）
    let finalVolatility = baseVolatility * scarcityFactor * liquidityFactor * 0.45;
    
    // ランダム要素追加（±15%のバリエーションに縮小）
    const randomFactor = 0.85 + (Math.random() * 0.3);
    finalVolatility *= randomFactor;

    // 価格変動率の計算
    let priceChangePercent: number;

    if (tradeType === "buy") {
      // 購入: 需要増加で価格上昇（倍率を縮小）
      priceChangePercent = finalVolatility * 1.8; // 購入時は1.8倍の上昇（2.5倍から減少）
      console.log(`[Buy Impact] Amount: ${tradeAmount}, Base: ${baseVolatility.toFixed(3)}%, Final: ${priceChangePercent.toFixed(3)}%`);
    } else {
      // 売却: 供給増加で価格下落（影響をさらに抑制）
      priceChangePercent = -finalVolatility * 0.3; // 売却時はさらに小さい影響（0.4倍から減少）
      console.log(`[Sell Impact] Amount: ${tradeAmount}, Base: ${baseVolatility.toFixed(3)}%, Final: ${priceChangePercent.toFixed(3)}%`);
    }

    // 新しい価格を計算
    const priceChange = currentPrice * (priceChangePercent / 100);
    const newPrice = Math.max(currentPrice + priceChange, 0.01); // 最低価格を0.01に設定

    console.log(`[Price Change] ${currentPrice} → ${newPrice} (${priceChangePercent.toFixed(2)}%)`);

    // 供給量を動的に更新（取引により市場に流通するコインが増減）
    const supplyChange = tradeType === "buy" ? tradeAmount * 0.1 : -tradeAmount * 0.05;
    const newSupply = Math.max(currentSupply + supplyChange, 100); // 最小供給量100

    // 24時間の変動データを更新
    const change24h = newPrice - currentPrice;
    const changePercent24h = (change24h / currentPrice) * 100;

    // 新しい時価総額を計算（新しい供給量を使用）
    const newMarketCap = newPrice * newSupply;

    // 24時間の高値・安値を更新
    const currentHigh24h = Number(this.coin.high_24h);
    const currentLow24h = Number(this.coin.low_24h);
    const newHigh24h = Math.max(newPrice, currentHigh24h);
    const newLow24h = Math.min(newPrice, currentLow24h || newPrice);

    return {
      current_price: new Decimal(newPrice),
      current_supply: new Decimal(newSupply), // 供給量も更新
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

  // ==================== 公開メソッド（取引・更新） ====================

  /**
   * 取引手数料を計算
   * @param amount 取引量
   * @param price 取引価格
   * @param tradeType 取引種別
   * @returns 手数料額
   */
  private calculateTradingFee(amount: number, price: number, tradeType: "buy" | "sell"): number {
    const { SELL_FEE_MULTIPLIER, MINIMUM_SELL_FEE_RATE, MINIMUM_SELL_FEE_AMOUNT } = BitCoin.TRADING_FEE_CONFIG;
    
    const baseFeeRate = Number(this.coin.trading_fee);
    const totalValue = amount * price;
    
    if (tradeType === "sell") {
      // 売却時は手数料を倍率適用 + 最低手数料を設定
      const sellFee = totalValue * baseFeeRate * SELL_FEE_MULTIPLIER;
      const minimumSellFee = Math.max(
        totalValue * MINIMUM_SELL_FEE_RATE, 
        MINIMUM_SELL_FEE_AMOUNT
      );
      return Math.max(sellFee, minimumSellFee);
    } else {
      // 購入時は通常の手数料
      return totalValue * baseFeeRate;
    }
  }

  /**
   * 取引の共通バリデーション
   * @param amount 取引量
   * @returns バリデーション結果
   */
  private validateTrade(amount: number): { isValid: boolean; error?: string } {
    if (amount <= 0) {
      return { isValid: false, error: "Amount must be positive" };
    }

    if (!this.coin.is_tradeable || !this.coin.is_active) {
      return { isValid: false, error: "This coin is not tradeable" };
    }

    return { isValid: true };
  }

  /**
   * 取引処理の共通実行
   * @param userId ユーザーID
   * @param amount 取引量
   * @param actualPrice 実際の価格
   * @param tradeType 取引タイプ
   * @returns 取引結果またはnull
   */
  private async executeTrade(
    userId: string,
    amount: number,
    actualPrice: number,
    tradeType: "buy" | "sell"
  ): Promise<{ coin: BitCoin; history: History } | null> {
    try {
      // 取引手数料を計算
      const tradingFee = this.calculateTradingFee(amount, actualPrice, tradeType);
      console.log(`[Trading Fee] Amount: ${amount}, Price: ${actualPrice}, Type: ${tradeType}, Fee: ${tradingFee.toFixed(4)}`);

      // ユーザーインスタンスを取得
      const user = await User.get(userId);
      if (!user) {
        console.error("User not found");
        return null;
      }

      // Bank取得と取引履歴記録を並行実行
      const [bank, tradeHistory] = await Promise.all([
        Bank.get(userId),
        this.recordTradeHistory(userId, amount, actualPrice, tradeType)
      ]);

      if (!bank) {
        console.error("Failed to get bank information");
        return null;
      }
      if (!tradeHistory) {
        console.error("Failed to record trade history");
        return null;
      }

      // 売却時の保有量チェック
      if (tradeType === "sell") {
        const availableAmount = await bank.getCoinAmount(this.coinId);
        if (availableAmount === null || availableAmount < amount) {
          console.error(`Insufficient holdings. Required: ${amount}, Available: ${availableAmount || 0}`);
          return null;
        }
      }

      // 購入時：コイン代金＋手数料を支払い
      // 売却時：売却代金から手数料を差し引き
      if (tradeType === "buy") {
        const totalCost = (amount * actualPrice) + tradingFee;
        if (user.user.base_coin.lessThan(totalCost)) {
          console.error(`Insufficient balance for purchase. Required: ${totalCost}, Available: ${user.user.base_coin}`);
          return null;
        }
        await user.pullBaseCoin(-totalCost); // 代金＋手数料を支払い
      } else {
        const totalRevenue = (amount * actualPrice) - tradingFee;
        await user.pullBaseCoin(totalRevenue); // 売却代金から手数料を差し引いて受け取り
      }

      // 価格更新とbank更新を並行実行
      const bankAmount = tradeType === "buy" ? amount : -amount;
      const [updatedCoin, bankResult] = await Promise.all([
        this.updatePriceByTrade(tradeType, amount, actualPrice),
        bank.update(this.coinId, bankAmount)
      ]);

      if (!updatedCoin) {
        console.error("Failed to update coin price");
        return null;
      }
      if (bankResult !== true) {
        console.error("Failed to update bank information");
        return null;
      }

      return { coin: updatedCoin, history: tradeHistory };
    } catch (error) {
      console.error(`Failed to execute ${tradeType} trade: ${(error as Error).message}`);
      return null;
    }
  }

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
    const validation = this.validateTrade(amount);
    if (!validation.isValid) {
      console.error(`Purchase validation failed: ${validation.error}`);
      return null;
    }

    const currentPrice = Number(this.coin.current_price);
    const actualPrice = pricePerCoin || currentPrice;

    return await this.executeTrade(buyerId, amount, actualPrice, "buy");
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
    const validation = this.validateTrade(amount);
    if (!validation.isValid) {
      console.error(`Sale validation failed: ${validation.error}`);
      return null;
    }

    const currentPrice = Number(this.coin.current_price);
    const actualPrice = pricePerCoin || currentPrice;

    return await this.executeTrade(sellerId, amount, actualPrice, "sell");
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
