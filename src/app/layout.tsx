import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import Header from "@/components/layout/header";
import User from "@/lib/user";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BitTryer - 暗号資産取引の経験を",
  description: "疑似環境による暗号資産取引の経験プラットフォーム",
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
        <main className="pt-16">{children}</main>

        <Toaster />
      </body>
    </html>
  );
}
