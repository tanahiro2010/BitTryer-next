"use client";

import { Button } from "@/components/ui/button";
import { Copy, Share2, Twitter, Facebook, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface ShareSectionProps {
    portfolioUrl: string;
}

export default function ShareSection({ portfolioUrl }: ShareSectionProps) {
    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(portfolioUrl);
            toast.success("Portfolio URL copied to clipboard!");
        } catch (error) {
            toast.error("Failed to copy URL");
        }
    };

    const handleTwitterShare = () => {
        const text = `Check out my crypto portfolio on BitTryer! 📈`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(portfolioUrl)}`;
        window.open(url, '_blank');
    };

    const handleFacebookShare = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(portfolioUrl)}`;
        window.open(url, '_blank');
    };

    const handleOpenPortfolio = () => {
        window.open(portfolioUrl, '_blank');
    };

    return (
        <div className="space-y-6">
            {/* ポートフォリオURL表示 */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                    Portfolio URL
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <code className="flex-1 text-sm text-gray-800 font-mono truncate">
                        {portfolioUrl}
                    </code>
                    <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={handleCopyUrl}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Separator />

            {/* ソーシャル共有ボタン */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">
                    Share on Social Media
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        onClick={handleTwitterShare}
                    >
                        <Twitter className="h-4 w-4 text-blue-500" />
                        Share on Twitter
                    </Button>

                    <Button
                        variant="outline"
                        className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        onClick={handleFacebookShare}
                    >
                        <Facebook className="h-4 w-4 text-blue-600" />
                        Share on Facebook
                    </Button>

                    <Button
                        variant="outline"
                        className="flex items-center gap-2 hover:bg-gray-50 hover:border-gray-200 transition-colors"
                        onClick={handleOpenPortfolio}
                    >
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                        Open Portfolio
                    </Button>
                </div>
            </div>
        </div>
    );
}
