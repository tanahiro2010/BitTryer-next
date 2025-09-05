import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import CoinCard from "@/components/ui/profile/coin";
import BitCoin from "@/lib/coin";
import User from "@/lib/user";
import Link from "next/link";

interface PageProps {
    searchParams: Promise<{
        page?: number;
    }>
}

const DISPLAY_LIMIT = 10;
const LIMIT = 50;

export default async function CoinsPage({ searchParams }: PageProps) {
    const [params, user] = await Promise.all([searchParams, User.current()]);
    if (!user) return redirect("/login");

    const page = parseInt(params.page as any) || 1;
    const bitcoins = await BitCoin.author(user?.userId, {
        limit: DISPLAY_LIMIT,
        page: page || 1
    });
    console.log(bitcoins);

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">作成コイン一覧 - ページ{page}</h1>
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
                {bitcoins.length !== LIMIT && (
                    <Link href={`/profile/coins/new`} className="w-full">
                        <Button className="w-full">新規コイン作成</Button>
                    </Link>
                )}
                {page > 1 && (
                    <Link href={`/profile/coins?page=${page - 1}`} className="w-full">
                        <Button className="w-full">前のページ</Button>
                    </Link>
                )}
                <Link href={`/profile/coins?page=${(page || 1) + 1}`} className="w-full">
                    <Button className="w-full">次のページ</Button>
                </Link>
                <Link href={`/profile/coins/all`} className="w-full">
                    <Button className="w-full">全てのコイン</Button>
                </Link>
            </div>
        </div>
    );
}