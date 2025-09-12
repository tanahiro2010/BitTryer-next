import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Coins, Wallet, ArrowUpDown, Plus, Minus } from "lucide-react";
import BitCoin from "@/lib/coin";
import Bank from "@/lib/bank";
import User from "@/lib/user";
import Link from "next/link";

export default async function TradeListPage() {
    const [user, bank] = await Promise.all([User.current(), Bank.current()]);
    if (!user) return redirect("/login");
    if (!bank) return redirect("/profile/bank");
    
    const coinIds = await bank.coins();
    if (!coinIds || coinIds.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="text-center py-12">
                    <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Coins in Portfolio</h2>
                    <p className="text-gray-600 mb-6">You don't have any coins to trade yet.</p>
                    <Button asChild>
                        <Link href="/profile/coins/all">Browse Coins</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const coins = await Promise.all(coinIds.map(async (coinId) => {
        const coin = await BitCoin.get(coinId.coin_id);
        return coin ? { coin, amount: coinId.amount } : null;
    }));

    const validCoins = coins.filter(Boolean);

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            {/* ヘッダー */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <ArrowUpDown className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Trading Portfolio</h1>
                </div>
                <p className="text-gray-600">Manage your cryptocurrency holdings and execute trades</p>
            </div>

            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Wallet className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Available Balance</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ¥{Number(user.user.base_coin).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Coins className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Holdings</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {validCoins.length} Coins
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Portfolio Value</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ¥{validCoins.reduce((total, item) => {
                                        if (!item?.coin) return total;
                                        return total + (Number(item.coin.coin.current_price) * Number(item.amount));
                                    }, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* コイン一覧 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5" />
                        Your Holdings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {validCoins.map((item) => {
                            if (!item?.coin) return null;
                            
                            const { coin, amount } = item;
                            const currentValue = Number(coin.coin.current_price) * Number(amount);
                            const change24h = Number(coin.coin.change_24h_percent);
                            const isPositive = change24h >= 0;

                            return (
                                <Link key={coin.coinId} href={`/profile/trade/${coin.coinId}`}>
                                    <div key={coin.coinId} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            {/* コイン情報 */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {coin.coin.symbol.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg text-gray-900">{coin.coin.name}</h3>
                                                    <p className="text-gray-600">{coin.coin.symbol.toUpperCase()}</p>
                                                </div>
                                            </div>

                                            {/* 保有量と価値 */}
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Holdings</p>
                                                <p className="font-semibold">{Number(amount).toLocaleString()} {coin.coin.symbol.toUpperCase()}</p>
                                                <p className="text-lg font-bold text-gray-900">¥{currentValue.toLocaleString()}</p>
                                            </div>

                                            {/* 価格と変動 */}
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Price</p>
                                                <p className="font-semibold">¥{Number(coin.coin.current_price).toLocaleString()}</p>
                                                <div className="flex items-center gap-1">
                                                    {isPositive ? (
                                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                                    )}
                                                    <span className={`text-sm font-medium ${
                                                        isPositive ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {isPositive ? '+' : ''}{change24h.toFixed(2)}%
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 取引ボタン */}
                                            <div className="flex gap-2">
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Buy
                                                </Button>
                                                <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                                                    <Minus className="h-4 w-4 mr-1" />
                                                    Sell
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}