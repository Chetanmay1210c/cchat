// app/api/chat/clear/route.ts
// Deletes all messages in a room but keeps the room + partner links.
import { NextResponse } from "next/server";
import { ensureMessagesCollection } from "@/lib/ensureCollections";

export async function POST(req: Request) {
  try {
    const { roomId } = await req.json();

    if (!roomId) {
      return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
    }

    const messages = await ensureMessagesCollection();

    // deleteMany removes all documents matching the filter in one call
    await messages.deleteMany({ roomId });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[clear]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}