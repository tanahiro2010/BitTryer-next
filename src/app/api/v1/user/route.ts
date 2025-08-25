import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/user";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const targetId = searchParams.get("id");
  const targetEmail = searchParams.get("email");

  if (!targetId && !targetEmail)
    return NextResponse.json(
      { error: true, message: "Missing user identifier" },
      { status: 400 },
    );

  const user = await User.get(targetId, targetEmail || undefined);
  if (!user)
    return NextResponse.json(
      { error: true, message: "User not found" },
      { status: 404 },
    );

  const { id, slug, email, password, base_coin, ...data } = user.user;
  return NextResponse.json({
    error: false,
    message: "Get user successful",
    data: { user: user },
  });
}

export async function PUT(req: NextRequest) {
  const payload = await req.json();
  const user = await User.current();
  if (!user)
    return NextResponse.json(
      { error: true, message: "User not found" },
      { status: 404 },
    );

  // ユーザー情報の更新処理
  try {
    const updatedUser = await user.update(payload);
    return NextResponse.json({
      error: false,
      message: "User updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    return NextResponse.json({
      error: true,
      message: `Failed to update user: ${(error as Error).message}`,
    });
  }
}
