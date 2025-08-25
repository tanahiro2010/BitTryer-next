import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import { getBaseUrl } from "@/utils/url";
import { redirect } from "next/navigation";
import { Share2 } from "lucide-react";
import PortfolioEditForm from "@/components/layout/profile/portfolio/form";
import ShareSection from "@/components/layout/profile/portfolio/share-section";
import User from "@/lib/user";

export default async function PortfolioSetting() {
  const [user, baseUrl] = await Promise.all([User.current(), getBaseUrl()]);
  if (!user) redirect("/login");

  // ユーティリティ関数を使用してURLを取得
  const portfolioUrl = `${baseUrl}/portfolio/${user.userId}`;
  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* ポートフォリオ設定カード */}
      <Card>
        <CardHeader>
          <CardTitle>
            Portfolio Settings
          </CardTitle>
          <CardDescription className="text-gray-600">
            Customize your portfolio appearance and information
          </CardDescription>
        </CardHeader>

        <PortfolioEditForm
          name={user.user.name ?? ""}
          description={user.user.description ?? ""}
        />
      </Card>

      {/* ポートフォリオ共有カード */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-green-600" />
            Share Your Portfolio
          </CardTitle>
          <CardDescription className="text-gray-600">
            Let others see your trading performance and coin collection
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <ShareSection 
            portfolioUrl={portfolioUrl}
          />
        </CardContent>
      </Card>
    </div>
  );
}
