"use server";
import { NextRequest, NextResponse } from "next/server";
import { CreateUser } from "@/types/prisma";
import { Prisma } from "@prisma/client";
import User from "@/lib/user";

const BEGINNING_BALANCE_NUMBER: number = 10 * 10000; // 10 * 1万円
const BEGINNING_BALANCE = Prisma.Decimal(BEGINNING_BALANCE_NUMBER.toString()); // 初期残高10万円

export async function POST(req: NextRequest) {
    const {
        email,
        password,
        name
    } = await req.json();

    const payload: CreateUser = { email, password, name, base_coin: BEGINNING_BALANCE };

    try {
        const user = await User.new(payload);
        if (!user) return NextResponse.json({ error: false, message: "Failed to register user. The email may already be in use." }, { status: 400 });

        return NextResponse.json({ error: false, message: "User registered successfully" }, { status: 201 });
    } catch (e) {
        console.error("Registration error:", e);
        return NextResponse.json({ error: false, message: "Failed to register user" }, { status: 500 });
    }
}