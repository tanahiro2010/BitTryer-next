"use client";
import { FormEvent } from "react";
import { toast } from "sonner";

async function handleUpdatePortfolio(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const toastID = "update-portfolio";
    toast.loading("ポートフォリオを更新しています...", { id: toastID });

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString();
    const description: string = formData.get("description")?.toString() ?? "";

    if (!name) {
        toast.error("ユーザー名は必須です");
        toast.dismiss(toastID);
        return;
    }


    // Proceed with the update
    try {
        const response = await fetch(`/api/v1/user`, {
            method: 'PUT',
            body: JSON.stringify({ name, description }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error("ポートフォリオの更新中にエラーが発生しました");
        }

        toast.success("ポートフォリオが正常に更新されました");
    } catch (error) {
        toast.error((error as Error).message || "不明なエラーが発生しました");
    } finally {
        toast.dismiss(toastID);
    }
    return;
}

export { handleUpdatePortfolio }