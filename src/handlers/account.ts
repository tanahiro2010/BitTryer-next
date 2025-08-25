"use client";
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
    password,
  };

  const response = await fetch("/api/v1/login", {
    method: "POST",
    body: JSON.stringify(paylaod),
    headers: {
      "Content-Type": "application/json",
    },
  });

  try {
    const body = await response.json();

    if (body.error) {
      throw new Error(body.error);
    }

    window.location.href = "/profile";
  } catch (e) {
    toast.error("ログインに失敗しました");
    console.error("Login error:", e);
  }

  toast.dismiss(loginId);
  return;
}

async function handleRegister(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  toast.loading("登録中...", { id: registerId });

  const formData = new FormData(e.currentTarget);
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");

  const payload = {
    email,
    password,
    name,
  };

  try {
    const response = await fetch("/api/v1/register", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const body = await response.json();

    if (body.error) {
      throw new Error(body.message);
    }

    window.location.href = "/login";
  } catch (e) {
    toast.error("登録に失敗しました");
    console.error("Registration error:", e);
  }

  toast.dismiss(registerId);
}

export { handleLogin, handleRegister };
