import { db } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST() {
  try {
    const token =
      (await cookies()).get(
        "token"
      )?.value;

    if (!token) {
      return Response.json({
        success: false,
      });
    }

    const decoded: any =
      jwt.verify(
        token,
        process.env.JWT_SECRET!
      );

    const users =
      db.collection("users");

    await users.updateOne(
      {
        username:
          decoded.username,
      },
      {
        $set: {
          isOnline: false,
          lastSeen:
            new Date(),
        },
      }
    );

    return Response.json({
      success: true,
    });

  } catch {
    return Response.json({
      success: false,
    });
  }
}