import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const token = (
      await cookies()
    ).get("token")?.value;

    if (!token) {
      return Response.json(
        {
          authenticated:
            false,
        },
        {
          status: 401,
        }
      );
    }

    const decoded =
      verifyToken(token);

    if (!decoded) {
      return Response.json(
        {
          authenticated:
            false,
        },
        {
          status: 401,
        }
      );
    }

    return Response.json({
      authenticated: true,
      user: decoded,
    });
  } catch {
    return Response.json(
      {
        authenticated:
          false,
      },
      {
        status: 401,
      }
    );
  }
}