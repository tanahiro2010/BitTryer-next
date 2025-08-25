"use client";
import { handleRegister } from "@/handlers/account";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";

function DesktopRegisterForm() {
  return (
    <form onSubmit={handleRegister}>
      <Label htmlFor="email" className="mt-4">
        メールアドレス
      </Label>
      <Input
        type="email"
        placeholder="メールアドレス"
        name="email"
        className="mt-2"
      />

      <Label htmlFor="password" className="mt-4">
        パスワード
      </Label>
      <Input
        type="password"
        placeholder="パスワード"
        name="password"
        className="mt-2"
      />

      <Label htmlFor="name" className="mt-4">
        名前
      </Label>
      <Input type="text" placeholder="名前" name="name" className="mt-2" />

      <Button className="mt-4 w-full cursor-pointer">登録</Button>

      <p className="mt-4 text-sm text-gray-600">
        既にアカウントをお持ちの方は
        <Link href="/login" className="text-blue-600 hover:underline">
          こちら
        </Link>
      </p>
    </form>
  );
}

function MobileRegisterForm() {
  return (
    <form className="mt-6" onSubmit={handleRegister}>
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
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium">
          名前
        </label>
        <Input type="text" name="name" placeholder="山田太郎" />
      </div>
      <Button type="submit" className="w-full cursor-pointer">
        登録
      </Button>

      <p className="mt-4 text-sm text-gray-600">
        既にアカウントをお持ちの方は
        <Link href="/login" className="text-blue-600 hover:underline">
          こちら
        </Link>
      </p>
    </form>
  );
}

export { DesktopRegisterForm, MobileRegisterForm };
