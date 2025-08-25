"use server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const uri = new URL(req.url);
  return NextResponse.redirect(`${uri.origin}/search?limit=10`);
}
