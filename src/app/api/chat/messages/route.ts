// app/api/chat/messages/route.ts
import { NextResponse } from "next/server";
import { ensureMessagesCollection } from "@/lib/ensureCollections";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
    }

    const messages = await ensureMessagesCollection();

    // Fetch all messages for this room, sorted oldest-first
    const docs = await messages
      .find({ roomId })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({ messages: docs });
  } catch (err) {
    console.error("[messages]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}