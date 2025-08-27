import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/components/layout/header";
import User from "@/lib/user";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "BitTryer - 暗号資産取引の経験を",
    template: "%s | BitTryer",
  },
  description:
    "疑似環境による暗号資産取引の経験プラットフォーム。安全な仮想環境でビットコイン取引を学習し、リアルタイムチャートと本格的な取引機能を体験できます。",
  keywords: [
    "BitTryer",
    "ビットトライヤー",
    "暗号資産",
    "仮想通貨",
    "ビットコイン",
    "取引",
    "シミュレーション",
    "練習",
    "デモ取引",
    "投資学習",
    "BTC",
    "cryptocurrency",
    "trading",
    "simulation",
    "demo",
  ],
  authors: [{ name: "BitTryer Team" }],
  creator: "BitTryer",
  publisher: "BitTryer",
  category: "Finance",
  classification: "Educational Trading Platform",

  // SEO設定
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 多言語・地域設定
  metadataBase: new URL("https://bittryer.com"),
  alternates: {
    canonical: "/",
    languages: {
      "ja-JP": "/",
      "en-US": "/en",
    },
  },

  // Open Graph（SNSシェア用）
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://bittryer.com",
    siteName: "BitTryer",
    title: "BitTryer - 暗号資産取引の経験を",
    description:
      "疑似環境による暗号資産取引の経験プラットフォーム。安全な仮想環境でビットコイン取引を学習できます。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BitTryer - 暗号資産取引プラットフォーム",
        type: "image/png",
      },
      {
        url: "/og-image-square.png",
        width: 400,
        height: 400,
        alt: "BitTryer ロゴ",
        type: "image/png",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    site: "@bittryer",
    creator: "@bittryer",
    title: "BitTryer - 暗号資産取引の経験を",
    description:
      "疑似環境でビットコイン取引を安全に学習。リアルタイムチャートと本格的な取引機能を体験。",
    images: ["/twitter-image.png"],
  },

  // アプリ情報
  applicationName: "BitTryer",
  referrer: "origin-when-cross-origin",
  colorScheme: "light dark",
  // themeColorはviewportエクスポートに移動

  // 検索エンジン認証
  verification: {
    google: "your-google-site-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-site-verification-code",
    other: {
      bing: "your-bing-verification-code",
    },
  },

  // マニフェスト（PWA対応）
  manifest: "/manifest.json",

  // その他設定
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // アーカイブ設定
  archives: ["https://bittryer.com/archive"],

  // ブックマーク
  bookmarks: ["https://bittryer.com/favorites"],
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await User.current();

  return (
    <html lang="ja">
      <body className={inter.className}>
        <Header login={!!user} />
        <main>{children}</main>

        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
