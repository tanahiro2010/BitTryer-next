"use client";
import { FormEvent } from "react";
import { toast } from "sonner";

const LOADING_TOAST_ID = "trade-loading";

export async function handleTrade(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.loading("取引を処理中...", { id: LOADING_TOAST_ID });

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const coinId = payload.coin_id as string;
    delete payload.coin_id;

    try {
        const response = await fetch(`/api/v2/coins/${coinId}/trade`, {
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
    }

    toast.dismiss(LOADING_TOAST_ID);
}