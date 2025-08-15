"use server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import User from "@/lib/user";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    try {
        const user = await User.get(null, email);
        if (!user) {
            return NextResponse.json(
                { error: true, message: "User not found" },
                { status: 404 },
            );
        }

        console.log(user.userId);

        const session = await user.login(password);
        const cookieStore = await cookies();
        cookieStore.set("s-token", session.token, {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
        return NextResponse.json(
            { error: false, message: "Login successful" },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            {
                error: true,
                message: "Login failed",
                data: { error: (error as any).message },
            },
            { status: 500 },
        );
    }
}
