import { headers } from "next/headers";

/**
 * SSRでアプリケーションのベースURLを取得するユーティリティ
 */
export async function getBaseUrl(): Promise<string> {
  // 1. 環境変数から取得（最優先）
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // 2. Vercelの環境変数を確認
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const headersList = await headers();

  const referer = headersList.get("referer");
  if (referer) {
    const uri = new URL(referer);
    return `${uri.protocol}//${uri.host}`;
  }

  // 3. リクエストヘッダーから取得
  try {
    const host = headersList.get("host");

    if (host) {
      // プロトコルの判定
      const forwardedProto = headersList.get("x-forwarded-proto");
      const protocol = forwardedProto ||
        (host.includes("localhost") ? "http" : "https");

      return `${protocol}://${host}`;
    }
  } catch (error) {
    console.warn("Could not get headers for URL determination:", error);
  }

  // 4. 環境に基づく推測
  if (process.env.NODE_ENV === "production") {
    return "https://bittryer.com";
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // 5. 最終フォールバック
  return "https://bittryer.com";
}

/**
 * 完全なURLを生成する
 */
export async function getFullUrl(path: string): Promise<string> {
  const baseUrl = await getBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
