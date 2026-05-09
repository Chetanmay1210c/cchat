import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { createToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(
  req: Request
) {
  try {
    const {
      username,
      password,
    } = await req.json();

    if (
      !username ||
      !password
    ) {
      return Response.json(
        {
          error:
            "Username and password required",
        },
        {
          status: 400,
        }
      );
    }

    const users =
      db.collection("users");

    const user =
      await users.findOne({
        username,
      });

    if (!user) {
      return Response.json(
        {
          error:
            "Invalid credentials",
        },
        {
          status: 401,
        }
      );
    }

    const match =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!match) {
      return Response.json(
        {
          error:
            "Invalid credentials",
        },
        {
          status: 401,
        }
      );
    }

    // 🌍 IP
    const ip =
      req.headers
        .get(
          "x-forwarded-for"
        )
        ?.split(",")[0] ||
      "unknown";

    // 📱 device
    const userAgent =
      req.headers.get(
        "user-agent"
      ) || "unknown";

    // 🟢 online
    await users.updateOne(
      { username },
      {
        $set: {
          online: true,
          lastSeen:
            new Date(),
          lastLoginIP:
            ip,
          userAgent,
        },
      }
    );

    // 🔑 create jwt
    const token =
      createToken({
        userId:
          user._id.toString(),
        username:
          user.username,
      });

    // 🍪 secure cookie
    (
      await cookies()
    ).set(
      "token",
      token,
      {
        httpOnly: true,
        secure:
          process.env
            .NODE_ENV ===
          "production",
        sameSite:
          "strict",
        path: "/",
        maxAge:
          60 * 15,
      }
    );

    return Response.json({
      success: true,
      username:
        user.username,
    });
  } catch (err) {
    console.log(err);

    return Response.json(
      {
        error:
          "Server error",
      },
      {
        status: 500,
      }
    );
  }
}