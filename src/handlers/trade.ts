"use client";
import { FormEvent } from "react";
import { toast } from "sonner";

export async function handleTrade(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`/api/v2/coins/${payload.coin_id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        
        if (result.error) {
            toast.error(result.message || "取引に失敗しました。");
        } else {
            toast.success("取引が成功しました！");
            window.location.reload();
        }
    } catch (e) {
        console.error("Trade error:", e);
        toast.error("取引中にエラーが発生しました。");
        return;
    }
}