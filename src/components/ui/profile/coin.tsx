import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BitCoin from "@/lib/coin";
import Link from "next/link";

interface CoinCardProps {
    bitcoin: BitCoin;
}

export default function CoinCard({ bitcoin }: CoinCardProps) {
    return (
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

            <CardFooter>
                <Link href={`/profile/trade/${bitcoin.coinId}`} className="w-full">
                    <Button size="sm" className="w-full">取引へ</Button>
                </Link>
            </CardFooter>
        </Card>
    )
}