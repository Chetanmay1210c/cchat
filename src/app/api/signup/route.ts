import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import UAParser from "ua-parser-js";

export async function POST(req: Request) {
  try {
    const { username, password, phone } = await req.json();

    // 🔒 validation
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

    // ⚠️ check existing
    const existing = await users.findOne({ username });
    if (existing) {
      return Response.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🌍 get IP
    const ip =
      req.headers.get("x-forwarded-for") || "unknown";

    // 📱 get user agent
    const userAgent = req.headers.get("user-agent") || "";

    // 🧠 parse device
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const browser = parser.getBrowser();
    const os = parser.getOS();

    // 💾 insert user
    await users.insertOne({
      username,
      password: hashedPassword,
      phone,

      createdAt: new Date(),

      // 📊 tracking data
      lastLoginAt: new Date(),
      lastLoginIP: ip,
      userAgent,

      device: device.model || "unknown",
      browser: browser.name || "unknown",
      os: os.name || "unknown",
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