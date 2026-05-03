import { db } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { username, password, phone, dob, gender } = await req.json();

    // 🔒 validation
    if (!username || !password || !phone) {
      return Response.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    const users = db.collection("users");

    const existing = await users.findOne({ username });

    if (existing) {
      return Response.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 create user
    await users.insertOne({
      username,
      password: hashedPassword,
      phone,

      dob: dob ? new Date(dob) : null,
      gender: gender || null,

      createdAt: new Date(),

      // optional tracking at signup
      lastLoginAt: null,
      lastLoginIP: null,
      userAgent: null,
    });

    return Response.json({
      success: true,
      message: "User created",
    });

  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}