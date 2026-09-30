import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import User from "@/model/User";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { tool, toolName, summary, details } = await req.json();

    if (!tool || !toolName || !summary) {
      return NextResponse.json(
        { error: "tool, toolName, and summary are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const updated = await User.findByIdAndUpdate(
      payload.userId,
      {
        $push: {
          activities: {
            $each: [
              {
                tool,
                toolName,
                summary,
                details: details ?? {},
                timestamp: new Date().toISOString(),
              },
            ],
            $position: 0,
            $slice: 100,
          },
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[account/activity]", err);
    return NextResponse.json(
      { error: "Unable to complete this request." },
      { status: 500 }
    );
  }
}