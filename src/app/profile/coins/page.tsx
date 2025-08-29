
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BitCoin from "@/lib/coin";
import Link from "next/link";

interface PageProps {
    searchParams: Promise<{
        page?: number;
    }>
}

const LIMIT = 50;

export default async function CoinsPage({ searchParams }: PageProps) {
    const { page } = await searchParams;
    const bitcoins = await BitCoin.tradeable(LIMIT, page || 1);

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">コイン一覧</h1>
            {bitcoins.length === 0 ? (
                <div className="text-center text-gray-500 py-12">取引可能なコインはありません。</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {bitcoins.map((bitcoin: BitCoin) => (
                        <Card key={bitcoin.coinId} className="shadow-sm border border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-800 truncate">
                                    {bitcoin.coin.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2">
                                    <div className="text-sm text-gray-600">シンボル: <span className="font-mono">{bitcoin.coin.symbol}</span></div>
                                    <div className="text-sm text-gray-600">価格: <span className="font-semibold">¥{Number(bitcoin.coin.current_price).toLocaleString()}</span></div>
                                    <div className="text-xs text-gray-500 mt-2 truncate">{bitcoin.coin.description || "説明なし"}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Link href={`/profile/coins/new`} className="w-full">
                <Button className="w-full">新規コイン作成</Button>
            </Link>
        </div>
    );
}