import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    // 🛠️ FIXED: Added await here because cookies() returns a Promise in Next.js 15+
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
      return Response.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return Response.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return Response.json({
      authenticated: true,
      user: {
        userId: (decoded as any).userId,
        username: (decoded as any).username,
      },
    });
  } catch (err) {
    return Response.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}