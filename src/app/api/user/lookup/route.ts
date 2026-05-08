import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { username } = await req.json();

  const user = await db.collection("users").findOne({ username });

  return Response.json({
    found: !!user,
  });
}