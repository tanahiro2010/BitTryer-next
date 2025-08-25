interface CoinCardProps {
    symbol: string;
    name: string;
    amount: string;
}

export default function CoinCard({ symbol, name, amount }: CoinCardProps) {
    return (
        <>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-bold">{ symbol }</span>
                    </div>
                    <div>
                        <p className="font-semibold">{ name }</p>
                        <p className="text-sm text-gray-600">{ symbol }</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold">{ amount }</p>
                </div>
            </div>
        </>
    )
}