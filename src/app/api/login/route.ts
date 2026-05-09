import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { createToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { username, password } =
      await req.json();

    if (!username || !password) {
      return Response.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    const users = db.collection("users");

    const user = await users.findOne({ username });

    if (!user) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🌍 IP + device
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";

    const userAgent =
      req.headers.get("user-agent") || "unknown";

    await users.updateOne(
      { username },
      {
        $set: {
          online: true,
          lastSeen: new Date(),
          lastLoginIP: ip,
          userAgent,
        },
      }
    );

    // 🔑 JWT
    const token = createToken({
      userId: user._id.toString(),
      username: user.username,
    });

    // 🍪 FIX HERE (IMPORTANT)
    const cookieStore = await cookies();

    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 5, // 5 min
    });

    return Response.json({
      success: true,
      username: user.username,
    });
  } catch (err) {
    console.log(err);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}