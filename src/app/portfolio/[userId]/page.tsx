import { Card, CardTitle, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import UserNotFound from "@/components/screen/user-not-found";
import User from "@/lib/user";
import { 
    User as UserIcon, 
    Wallet, 
    TrendingUp, 
    Calendar,
    DollarSign,
    Activity 
} from "lucide-react";

interface PortfolioProps {
    params: Promise<{ userId: string }>;
}

export default async function Portfolio({ params }: PortfolioProps) {
    const { userId } = await params;
    const user = await User.get(userId);
    if (!user) {
        return <UserNotFound />;
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* ヘッダーカード */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                <UserIcon className="h-12 w-12 text-white" />
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    {user.user.name || "Anonymous User"}
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    Client ID: {user.user.client_id || "This user has no client ID."}
                                </p>
                                <p className="text-gray-600 text-lg mb-4">
                                    {user.user.description || "This user has no description."}
                                </p>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        Member since {new Date(user.user.createdAt).toLocaleDateString('ja-JP')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 統計カード群 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* ポートフォリオ価値 */}
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <Wallet className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Portfolio Value</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {String(user.user.base_coin)} <span className="text-lg text-gray-600">Coins</span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 今日の変動 */}
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">24h Change</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        +0.00% <span className="text-lg text-gray-600">$0.00</span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 取引回数 */}
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Activity className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Trades</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        0 <span className="text-lg text-gray-600">trades</span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ポートフォリオ詳細 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 保有コイン */}
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                                <CardTitle className="text-xl">Holdings</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <span className="text-yellow-600 font-bold">BC</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Base Coin</p>
                                            <p className="text-sm text-gray-600">BTC</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{String(user.user.base_coin)}</p>
                                        <p className="text-sm text-gray-600">$0.00</p>
                                    </div>
                                </div>
                                <div className="text-center py-8 text-gray-500">
                                    <p>No other holdings yet</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 取引履歴 */}
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <Activity className="h-6 w-6 text-green-600" />
                                <CardTitle className="text-xl">Recent Trades</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-gray-500">
                                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-lg font-medium mb-2">No trades yet</p>
                                <p className="text-sm">Trading history will appear here</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}