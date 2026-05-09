import { cookies } from "next/headers";

export async function POST() {
  (
    await cookies()
  ).set("token", "", {
    maxAge: 0,
    path: "/",
  });

  return Response.json({
    success: true,
  });
}