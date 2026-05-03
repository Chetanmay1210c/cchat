import { db } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { username, password, phone } = await req.json();

    // 🔒 Validation
    if (!username || !password || !phone) {
      return Response.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 chars" },
        { status: 400 }
      );
    }

    const users = db.collection("users");

    // ⚠️ Check existing user
    const existing = await users.findOne({ username });
    if (existing) {
      return Response.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🌍 Get IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    // 📱 Get user agent
    const userAgent = req.headers.get("user-agent") || "unknown";

    // 💾 Insert user (NO ua-parser → no errors)
    await users.insertOne({
      username,
      password: hashedPassword,
      phone,

      createdAt: new Date(),

      // 📊 tracking (basic, stable)
      lastLoginAt: new Date(),
      lastLoginIP: ip,
      userAgent,
    });

    return Response.json({ success: true });

  } catch (err) {
    console.error("Signup Error:", err);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}