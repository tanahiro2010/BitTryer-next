import HeroTitle from "@/components/layout/home/HeroTitle";
import WarningNotice from "@/components/layout/home/WarningNotice";
import WelcomeBonus from "@/components/layout/home/WelcomeBonus";
import FeatureList from "@/components/layout/home/FeatureList";
import PriceCard from "@/components/layout/home/PriceCard";
import FeatureCard from "@/components/layout/home/FeatureCard";
import ActionButtons from "@/components/layout/home/ActionButtons";

const features = [
  "ベーシックな取引体験",
  "API を利用した自動取引",
  "課金制サイト内通貨で疑似取引",
  "幅広いシナリオでの取引体験",
];

const featureCards = [
  {
    icon: "₿",
    title: "安全な疑似環境",
    description:
      "完全にゲーム内での取引体験。実際のお金を使わず、換金もできない安全な環境です",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: "¥",
    title: "サイト内通貨",
    description:
      "初回10万円分プレゼント！課金でサイト内通貨を追加購入できます。※ゲーム内通貨のため換金はできません",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    icon: "API",
    title: "API取引対応",
    description: "プログラムによる自動取引を学習できます",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: "📊",
    title: "リアルタイムデータ",
    description: "実際の市場に近いデータで学習できます",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
];

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="py-16 lg:py-20">
        {/* キャッチフレーズ - 全幅 */}
        <HeroTitle />

        {/* コンテンツエリア - 左右分割 */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Left Content */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div className="space-y-6">
              <p className="text-lg text-gray-600 leading-relaxed">
                ここでは、疑似通貨、疑似環境による暗号資産取引の経験を行うことができます。
                課金により取得したサイト内通貨で、リアルな取引体験をお楽しみください。
              </p>

              <WarningNotice />
              <WelcomeBonus />
            </div>

            <FeatureList features={features} />
          </div>

          {/* Right Content */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <PriceCard />
          </div>
        </div>
      </div>

      <ActionButtons />

      {/* Features Section */}
      <div className="border-t py-16">
        <div className="text-center space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">
            なぜBitTryerを選ぶのか
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {featureCards.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                bgColor={feature.bgColor}
                iconColor={feature.iconColor}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
