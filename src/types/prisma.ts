import { Decimal } from "@prisma/client/runtime/library";

// ===============================
// Base Types (基本型)
// ===============================

export interface BaseUser {
  id: string;
  client_id: string;
  email: string;
  password: string;
  name: string | null;
  slug: string | null;
  base_coin: Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseSession {
  id: string;
  token: string;
  user_id: string;
  created_at: Date;
  expires_at: Date;
}

export interface BaseCoin {
  id: string;
  coin_id: string;
  name: string;
  symbol: string;
  description: string | null;
  creator_id: string;
  total_supply: Decimal;
  current_supply: Decimal;
  initial_price: Decimal;
  current_price: Decimal;
  high_24h: Decimal;
  low_24h: Decimal;
  volume_24h: Decimal;
  change_24h: Decimal;
  change_24h_percent: Decimal;
  market_cap: Decimal;
  rank: number | null;
  is_active: boolean;
  is_tradeable: boolean;
  is_mineable: boolean;
  trading_fee: Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export interface BasePortfolio {
  id: string;
  user_id: string;
  coin_id: string;
  amount: Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseTradeHistory {
  id: string;
  history_id: string;
  user_id: string;
  coin_id: string;
  amount: Decimal;
  price: Decimal;
  side: TradeType;
  author_id: string | null;
  status: TradeStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ===============================
// Enum Types (列挙型)
// ===============================

export enum TradeType {
  BUY = "buy",
  SELL = "sell",
  SEND = "send",
  CATCH = "catch",
}

export enum TradeStatus {
  LOADING = "loading",
  COMPLETED = "completed",
  FAILED = "failed",
}

// ===============================
// Relations Types (リレーション型)
// ===============================

// User with relations
export interface UserWithCoins extends BaseUser {
  createdCoins: BaseCoin[];
}

export interface UserWithSessions extends BaseUser {
  sessions: BaseSession[];
}

export interface UserWithAll extends BaseUser {
  createdCoins: BaseCoin[];
  sessions: BaseSession[];
}

// Coin with relations
export interface CoinWithCreator extends BaseCoin {
  creator: Pick<BaseUser, "id" | "name" | "email">;
}

// Session with relations
export interface SessionWithUser extends BaseSession {
  user: Pick<BaseUser, "id" | "name" | "email">;
}

// ===============================
// API Response Types (API レスポンス型)
// ===============================

// Public user info (パスワードを除く)
export interface PublicUser extends Omit<BaseUser, "password"> {}

// Public coin info
export interface PublicCoin extends BaseCoin {
  creator: {
    id: string;
    name: string | null;
  };
}

// Portfolio with coin info
export interface PortfolioWithCoin extends BasePortfolio {
  coin: Pick<BaseCoin, "id" | "name" | "symbol" | "current_price">;
}

// Trade history with coin info
export interface TradeHistoryWithCoin extends BaseTradeHistory {
  coin: Pick<BaseCoin, "id" | "name" | "symbol">;
}

// ===============================
// Form Types (フォーム型)
// ===============================

// User registration form
export interface UserRegistrationForm {
  email: string;
  password: string;
  name?: string;
}

// User login form
export interface UserLoginForm {
  email: string;
  password: string;
}

// Coin creation form
export interface CoinCreationForm {
  name: string;
  symbol: string;
  description?: string;
  total_supply: number;
  initial_price: number;
}

// Trade form
export interface TradeForm {
  coin_id: string;
  amount: number;
  price?: number;
  side: TradeType;
}

// ===============================
// Database Query Types (クエリ型)
// ===============================

// User select options
export type UserSelect = {
  id?: boolean;
  client_id?: boolean;
  email?: boolean;
  name?: boolean;
  slug?: boolean;
  base_coin?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  createdCoins?: boolean;
  sessions?: boolean;
};

// Coin select options
export type CoinSelect = {
  id?: boolean;
  coin_id?: boolean;
  name?: boolean;
  symbol?: boolean;
  description?: boolean;
  creator_id?: boolean;
  creator?: boolean;
  total_supply?: boolean;
  current_supply?: boolean;
  initial_price?: boolean;
  current_price?: boolean;
  high_24h?: boolean;
  low_24h?: boolean;
  volume_24h?: boolean;
  change_24h?: boolean;
  change_24h_percent?: boolean;
  market_cap?: boolean;
  rank?: boolean;
  is_active?: boolean;
  is_tradeable?: boolean;
  is_mineable?: boolean;
  trading_fee?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
};

// ===============================
// Utility Types (ユーティリティ型)
// ===============================

// Create types (ID等を除いた作成用 - defaultがあるフィールドも除外)
export type CreateUser = Omit<
  BaseUser,
  "id" | "client_id" | "slug" | "createdAt" | "updatedAt"
>;
export type CreateCoin = Omit<
  BaseCoin,
  | "id"
  | "total_supply"
  | "current_supply"
  | "initial_price"
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
  | "is_mineable"
  | "trading_fee"
  | "createdAt" 
  | "updatedAt"
>;
export type CreatePortfolio = Omit<
  BasePortfolio,
  "id" | "createdAt" | "updatedAt"
>;
export type CreateTradeHistory = Omit<
  BaseTradeHistory,
  "id" | "history_id" | "createdAt" | "updatedAt"
>;

// Update types (更新可能フィールドのみ)
export type UpdateUser = Partial<Pick<BaseUser, "name" | "slug" | "base_coin">>;
export type UpdateCoin = Partial<
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
>;
export type UpdatePortfolio = Partial<Pick<BasePortfolio, "amount">>;
export type UpdateTradeHistory = Partial<Pick<BaseTradeHistory, "status">>;
