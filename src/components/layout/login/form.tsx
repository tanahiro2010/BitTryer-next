'use client';
import { handleLogin } from "@/handlers/account";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function LoginForm() {
    return (
        <form onSubmit={handleLogin}>
            <Label htmlFor="email" className="mt-4">メールアドレス</Label>
            <Input
                placeholder="メールアドレス"
                name="email"
                className="mt-2"
            />
            <Label htmlFor="password" className="mt-4">パスワード</Label>
            <Input
                placeholder="パスワード"
                name="password"
                className="mt-2"
            />
            <Button className="mt-4 w-full cursor-pointer">ログイン</Button>
        </form>
    );
}