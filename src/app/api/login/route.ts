import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // 🔒 validation
    if (!username || !password) {
      return Response.json(
        { error: "Username & password required" },
        { status: 400 }
      );
    }

    const users = db.collection("users");

    // 🔍 find user
    const user = await users.findOne({ username });

    if (!user) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🔐 check password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🌍 IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";

    // 📱 device
    const userAgent =
      req.headers.get("user-agent") || "unknown";

    // 🕒 update login info
    await users.updateOne(
      { username },
      {
        $set: {
          lastLoginAt: new Date(),
          lastLoginIP: ip,
          userAgent,
        },
      }
    );

    // 🔑 JWT (30 min session)
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "30m",
      }
    );

    // 🍪 cookie
    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 30,
      path: "/",
    });

    return Response.json({
      success: true,
      message: "Login successful",
    });

  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}