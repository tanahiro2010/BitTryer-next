import {
    User as UserIcon,
    Wallet,
    Calendar,
    DollarSign,
    Activity,
} from "lucide-react";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { getBaseUrl } from "@/utils/url";
import ShareSection from "@/components/layout/profile/portfolio/share-section";
import UserNotFound from "@/components/screen/user-not-found";
import CoinCard from "@/components/ui/portfolio/coin";
import History from "@/lib/history";
import User from "@/lib/user";

interface PortfolioProps {
    params: Promise<{ userId: string }>;
}

export default async function Portfolio({ params }: PortfolioProps) {
    // paramsを先に解決してからユーザーを取得
    const { userId } = await params;
    const user = await User.get(userId);
    if (!user) return <UserNotFound />;
    const [histories, historyCount, baseUrl] = await Promise.all([
        History.some({ user_id: user.userId }, { limit: 5, orderBy: { field: 'createdAt', direction: 'desc' } }),
        History.count({ user_id: user.userId }),
        getBaseUrl()
    ]);

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
                                    Client ID:{" "}
                                    {user.user.client_id || "This user has no client ID."}
                                </p>
                                <p className="text-gray-600 text-lg mb-4">
                                    {user.user.description || "This user has no description."}
                                </p>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        Member since{" "}
                                        {new Date(user.user.createdAt).toLocaleDateString("ja-JP")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 統計カード群 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ポートフォリオ価値 */}
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <Wallet className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Total Balance
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ¥{Number(user.user.base_coin).toLocaleString()}{" "}
                                        <span className="text-lg text-gray-600">Moneys</span>
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
                                        {historyCount.toLocaleString()} <span className="text-lg text-gray-600">trades</span>
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
                                <CoinCard symbol="BC" name="BaseCoin" amount={`¥${Number(user.user.base_coin).toLocaleString()}`} />

                                {/* { [].map((coin) => {
                                    <CoinCard key={coin.id} {...coin} />
                                }) } */}
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

                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <Activity className="h-6 w-6 text-green-600" />
                            <CardTitle className="text-xl">Share Portfolio</CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <ShareSection portfolioUrl={`${baseUrl}/portfolio/${user.userId}`} />
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
