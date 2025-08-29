'use client';
import { FormEvent } from "react";
import { toast } from "sonner";

const LoadingID = "loading";

export async function handleCreateCoin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.loading("コインを作成中...", { id: LoadingID });

    const formData = new FormData(e.currentTarget);
    const coinData = {
        name: formData.get("name"),
        symbol: formData.get("symbol"),
        price: formData.get("price"),
        description: formData.get("description"),
    };

    try {
        const response = await fetch("/api/v2/coins", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(coinData)
        });

        

    } catch (error) {
        console.error("Error creating coin:", error);
        toast.error("コインの作成に失敗しました。自身の所持コインが足りているか確認してください。");
        toast.dismiss(LoadingID);
    }
}