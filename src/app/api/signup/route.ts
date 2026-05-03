import { db } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { username, password, phone } = await req.json();

    // 🔒 Basic validation
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

    // 💾 Insert user
    await users.insertOne({
      username,
      password: hashedPassword,
      phone,
      createdAt: new Date(),
    });

    return Response.json({ success: true });

  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}