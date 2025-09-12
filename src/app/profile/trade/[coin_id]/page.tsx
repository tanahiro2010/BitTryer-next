import { redirect } from "next/navigation";
import TradeForm from "@/components/layout/profile/trade/form";
import BitCoin from "@/lib/coin";
import User from "@/lib/user";
import Bank from "@/lib/bank";

interface TradePageProps {
    params: Promise<{
        coin_id: string;
    }>;
}

export default async function TradePage({ params }: TradePageProps) {
    const [{ coin_id }, user] = await Promise.all([params, User.current()]);
    if (!user) return redirect("/login");
    const [bitcoin, bank] = await Promise.all([BitCoin.get(coin_id), Bank.get(user.userId)]);
    if (!bitcoin || !bank) return redirect("/profile/coins/all");
    
    const holdings = await bank.getCoinAmount(coin_id);

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <TradeForm 
                coinId={coin_id} 
                coinName={bitcoin.coin.name} 
                coinSymbol={bitcoin.coin.symbol} 
                currentPrice={bitcoin.coin.current_price.toNumber()} 
                availableBalance={user.user.base_coin.toNumber()} 
                holdings={holdings || 0} 
                tradingFeeRate={bitcoin.coin.trading_fee.toNumber()}
            />
        </div>
    )
}