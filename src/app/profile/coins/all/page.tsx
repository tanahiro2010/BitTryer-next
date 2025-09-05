import { Button } from "@/components/ui/button";
import CoinCard from "@/components/ui/profile/coin";
import BitCoin from "@/lib/coin";
import User from "@/lib/user";
import Link from "next/link";

interface PageProps {
    searchParams: Promise<{
        page?: number;
        q?: string;
    }>
}

const DISPLAY_LIMIT = 10;

export default async function AllCoinsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = parseInt(params.page as any) || 1;
    const q = params.q;
    const query = {};
    if (q) {
        Object.assign(query, { name: { contains: q, mode: "insensitive" } });
    }
    const bitcoins = await BitCoin.some({ ...query, is_active: true }, {
        limit: DISPLAY_LIMIT,
        page: page
    });

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">コイン一覧 - ページ{page}</h1>
            {bitcoins.length === 0 ? (
                <div className="text-center text-gray-500 py-12">取引可能なコインはありません。</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {bitcoins.map((bitcoin: BitCoin) => (
                        <CoinCard key={bitcoin.coinId} bitcoin={bitcoin} />
                    ))}
                </div>
            )}

            <div className="mt-5 space-y-2 flex items-center flex-col">
                {page > 1 && (
                    <Link href={`/profile/coins/all?page=${page - 1}`} className="w-full">
                        <Button className="w-full">前のページ</Button>
                    </Link>
                )}
                <Link href={`/profile/coins/all?page=${(page || 1) + 1}`} className="w-full">
                    <Button className="w-full">次のページ</Button>
                </Link>
            </div>
        </div>
    );
}