import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import User from "@/model/User";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ user: null });

    const payload = await verifyToken(token);
    if (!payload) {
      const res = NextResponse.json({ user: null });
      res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
      return res;
    }

    await connectDB();
    const user = await User.findById(payload.userId).lean();
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: {
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        activities: user.activities ?? [],
      },
    });
  } catch (err) {
    console.error("[auth/me]", err);
    return NextResponse.json(
      { error: "Unable to complete this request." },
      { status: 500 }
    );
  }
}