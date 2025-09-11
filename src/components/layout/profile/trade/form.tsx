"use client";
import { ArrowUpDown, TrendingUp, TrendingDown, Calculator, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { handleTrade } from "@/handlers/trade";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";



interface TradeFormProps {
    coinId?: string;
    coinName?: string;
    coinSymbol?: string;
    currentPrice?: number;
    availableBalance?: number;
    holdings?: number;
}

export default function TradeForm({ 
    coinId,
    coinName = "Select Coin", 
    coinSymbol = "", 
    currentPrice = 0, 
    availableBalance = 0,
    holdings = 0 
}: TradeFormProps) {
    const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
    const [amount, setAmount] = useState("");
    const [price, setPrice] = useState(currentPrice.toString());
    
    const totalCost = Number(amount) * Number(price);
    const isBuy = tradeType === "buy";
    const canAfford = isBuy ? totalCost <= availableBalance : Number(amount) <= holdings;

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <ArrowUpDown className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-xl">Trade {coinSymbol.toUpperCase()}</CardTitle>
                </div>
                <CardDescription>{coinName}</CardDescription>
                {currentPrice > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="text-sm text-gray-600">Current Price:</span>
                        <Badge variant="outline" className="font-mono">
                            ¥{currentPrice.toLocaleString()}
                        </Badge>
                    </div>
                )}
            </CardHeader>

            <CardContent>
                {/* Current Holdings Display */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-center">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">Current Holdings</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-blue-700">Available Balance:</span>
                                <span className="font-mono font-semibold text-blue-900">
                                    ¥{availableBalance.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-blue-700">{coinSymbol.toUpperCase()} Holdings:</span>
                                <span className="font-mono font-semibold text-blue-900">
                                    {holdings.toLocaleString()} {coinSymbol.toUpperCase()}
                                </span>
                            </div>
                            {holdings > 0 && currentPrice > 0 && (
                                <div className="flex justify-between items-center pt-2 border-t border-blue-300">
                                    <span className="text-sm text-blue-700">Holdings Value:</span>
                                    <span className="font-mono font-semibold text-blue-900">
                                        ¥{(holdings * currentPrice).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleTrade} className="space-y-6">
                    {/* Trade Type Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="type" className="text-sm font-medium">Trade Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant={isBuy ? "default" : "outline"}
                                onClick={() => setTradeType("buy")}
                                className={`flex items-center gap-2 ${
                                    isBuy ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50 hover:text-green-600"
                                }`}>
                                <TrendingUp className="h-4 w-4" />
                                Buy
                            </Button>
                            <Button
                                type="button"
                                variant={!isBuy ? "default" : "outline"}
                                onClick={() => setTradeType("sell")}
                                className={`flex items-center gap-2 ${
                                    !isBuy ? "bg-red-600 hover:bg-red-700" : "hover:bg-red-50 hover:text-red-600"
                                }`}>
                                <TrendingDown className="h-4 w-4" />
                                Sell
                            </Button>
                        </div>
                    </div>

                    {/* Trade Limits Display */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-2">
                            {isBuy ? "Available for Purchase" : "Available for Sale"}
                        </div>
                        {isBuy ? (
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Max Purchasable:</span>
                                    <span className="font-mono">
                                        {currentPrice > 0 
                                            ? `${(availableBalance / currentPrice).toLocaleString(undefined, {
                                                maximumFractionDigits: 8
                                            })} ${coinSymbol.toUpperCase()}`
                                            : "Set price first"
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Using Balance:</span>
                                    <span className="font-mono">¥{availableBalance.toLocaleString()}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Available to Sell:</span>
                                    <span className="font-mono">{holdings.toLocaleString()} {coinSymbol.toUpperCase()}</span>
                                </div>
                                {holdings > 0 && currentPrice > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>Estimated Value:</span>
                                        <span className="font-mono">¥{(holdings * currentPrice).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="amount" className="text-sm font-medium">Amount</Label>
                            {!isBuy && holdings > 0 && (
                                <span className="text-xs text-gray-500">
                                    Available: {holdings.toLocaleString()} {coinSymbol.toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.00000001"
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="pr-16"
                                required
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-mono">
                                {coinSymbol.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Price Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="price" className="text-sm font-medium">Price per Coin</Label>
                            {currentPrice > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPrice(currentPrice.toString())}
                                    className="text-xs h-auto p-1"
                                >
                                    Use Market Price
                                </Button>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                className="pr-12"
                                required
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                ¥
                            </div>
                        </div>
                    </div>

                    {/* Calculation Summary */}
                    {amount && price && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Calculator className="h-4 w-4" />
                                Order Summary
                            </div>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="font-mono">{Number(amount).toLocaleString()} {coinSymbol.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Price:</span>
                                    <span className="font-mono">¥{Number(price).toLocaleString()}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                    <span>Total {isBuy ? "Cost" : "Proceeds"}:</span>
                                    <span className="font-mono">¥{totalCost.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Balance Check */}
                            {!canAfford && (
                                <div className="flex items-center gap-2 text-red-600 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>
                                        {isBuy 
                                            ? `Insufficient balance (Available: ¥${availableBalance.toLocaleString()})` 
                                            : `Insufficient holdings (Available: ${holdings.toLocaleString()} ${coinSymbol.toUpperCase()})`
                                        }
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button 
                        type="submit" 
                        className={`w-full ${
                            isBuy 
                                ? "bg-green-600 hover:bg-green-700" 
                                : "bg-red-600 hover:bg-red-700"
                        }`}
                        disabled={!amount || !price || !canAfford} >
                        {isBuy ? "Buy" : "Sell"} {coinSymbol.toUpperCase()}
                    </Button>

                    {/* Balance Info */}
                    <div className="border-t pt-4">
                        <div className="text-center text-xs text-gray-500 space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-left">
                                    <div className="font-medium text-gray-700">Cash Balance</div>
                                    <div className="font-mono">¥{availableBalance.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-gray-700">{coinSymbol.toUpperCase()} Holdings</div>
                                    <div className="font-mono">{holdings.toLocaleString()}</div>
                                </div>
                            </div>
                            {holdings > 0 && currentPrice > 0 && (
                                <div className="pt-2 border-t border-gray-200">
                                    <div className="font-medium text-gray-700">Total Portfolio Value</div>
                                    <div className="font-mono text-lg">
                                        ¥{(availableBalance + (holdings * currentPrice)).toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                    <input type="hidden" name="coin_id" value={coinId} />
                    <input type="hidden" name="trade_type" value={tradeType} />
                </form>
            </CardContent>
        </Card>
    );
}