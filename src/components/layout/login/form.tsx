"use client";
import { handleLogin } from "@/handlers/account";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";

function DesktopLoginForm() {
  return (
    <form onSubmit={handleLogin}>
      <Label htmlFor="email" className="mt-4">
        メールアドレス
      </Label>
      <Input placeholder="メールアドレス" name="email" className="mt-2" />
      <Label htmlFor="password" className="mt-4">
        パスワード
      </Label>
      <Input placeholder="パスワード" name="password" className="mt-2" />
      <Button className="mt-4 w-full cursor-pointer">ログイン</Button>

      <p className="mt-4 text-sm text-gray-600">
        まだアカウントをお持ちでない方は
        <Link href={`/register`} className="text-blue-600 hover:underline">
          こちら
        </Link>
      </p>
    </form>
  );
}

function MobileLoginForm() {
  return (
    <form className="mt-6" onSubmit={handleLogin}>
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium">
          メールアドレス
        </label>
        <Input type="email" name="email" placeholder="email@email.com" />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium">
          パスワード
        </label>
        <Input type="password" name="password" placeholder="●●●●●●●●●●" />
      </div>
      <Button type="submit" className="w-full cursor-pointer">
        ログイン
      </Button>

      <p className="mt-4 text-sm text-gray-600">
        アカウントをお持ちでない方は
        <Link href="/register" className="text-blue-600 hover:underline">
          こちら
        </Link>
      </p>
    </form>
  );
}

export { DesktopLoginForm, MobileLoginForm };
