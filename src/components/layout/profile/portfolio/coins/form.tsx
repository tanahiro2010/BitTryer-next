'use client';
import { handleCreateCoin } from "@/handlers/coins";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateCoinForm() {
    return (
        <form onSubmit={handleCreateCoin} className="space-y-2">
            <Input type="text" placeholder="コイン名" name="name"/>
            <Input type="text" placeholder="シンボル(例: BTC)" name="symbol"/>
            <Input type="number" placeholder="1コインの値段(作成後自身のbase_coinから差し引かれます)" name="price"/>
            <Textarea placeholder="説明" name="description"/>
            <Button type="submit">作成</Button>
        </form>
    )
}