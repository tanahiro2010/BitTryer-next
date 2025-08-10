import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PriceData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
}

const mockPriceData: PriceData[] = [
  {
    symbol: "BTC/JPY",
    name: "Bitcoin",
    price: "¥6,234,567",
    change: "+2.34%",
    isPositive: true,
  },
  {
    symbol: "ETH/JPY",
    name: "Ethereum",
    price: "¥432,109",
    change: "-1.23%",
    isPositive: false,
  },
];

export default function PriceCard() {
  return (
    <div className="w-full max-w-sm sm:max-w-md">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base sm:text-lg">リアルタイム価格</CardTitle>
            <span className="text-xs sm:text-sm text-muted-foreground">模擬データ</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockPriceData.map((data, index) => (
            <div key={index} className="flex justify-between items-center p-2 sm:p-3 bg-muted rounded-md">
              <div>
                <div className="font-medium text-sm sm:text-base">{data.symbol}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{data.name}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm sm:text-base">{data.price}</div>
                <div className={`text-xs sm:text-sm ${data.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {data.change}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
