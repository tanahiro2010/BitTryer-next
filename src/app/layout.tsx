import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import Header from '@/components/layout/header';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BitTryer - 暗号資産取引の経験を",
  description: "疑似環境による暗号資産取引の経験プラットフォーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Header />
        <main className="pt-16">
          {children}
        </main>
        
        <Toaster />
      </body>
    </html>
  );
}
