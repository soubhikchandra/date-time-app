import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/model/User";
import bcrypt from "bcryptjs";
import { signToken, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  try {
    // ── LOGOUT ─────────────────────────────────────────
    if (action === "logout") {
      const res = NextResponse.json(
        { success: true },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
      res.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });
      return res;
    }

    await connectDB();
    const body = await req.json();

    // ── SIGNUP ─────────────────────────────────────────
    if (action === "signup") {
      const { name, email, password } = body;

      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json(
          { error: "That email is already registered." },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: name?.trim() || undefined,
        email: email.toLowerCase(),
        passwordHash,
        activities: [],
      });

      const token = await signToken({
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      });

      const res = NextResponse.json({
        success: true,
        user: { email: user.email, name: user.name },
      });

      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return res;
    }

    // ── LOGIN ──────────────────────────────────────────
    if (action === "login") {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const token = await signToken({
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      });

      const res = NextResponse.json({
        success: true,
        user: { email: user.email, name: user.name },
      });

      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return res;
    }

    // ── UNKNOWN ────────────────────────────────────────
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 404 });
  } catch (err) {
    console.error("[auth/[action]]", err);
    return NextResponse.json(
      { error: "Unable to complete this request." },
      { status: 500 }
    );
  }
}