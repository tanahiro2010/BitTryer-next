'use client';
import { FormEvent } from "react";
import { toast } from "sonner";

const loginId = "login-loading";
const registerId = "register-loading";

async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.loading("ログイン中...", { id: loginId });

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const paylaod = {
        email,
        password
    }

    

    toast.success("ログインに成功しました");
    toast.dismiss(loginId);
}

async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.loading("登録中...", { id: registerId });
}

export { handleLogin, handleRegister }