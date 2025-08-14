import { randomBytes } from "crypto";

async function generateToken(length: number = 32): Promise<string> {
  return randomBytes(length).toString("hex"); // 16進数の文字列に変換
}

async function generateUniqueNumber(): Promise<string> {
  const timestamp = Date.now();
  const randomPart = Math.floor(Math.random() * 1_000_000_000);

  return `${timestamp}${randomPart}`;
}

export { generateToken, generateUniqueNumber };
