// app/api/chat/react/route.ts
// Persists the full reactions array for a message.
import { NextResponse } from "next/server";
import { ensureMessagesCollection } from "@/lib/ensureCollections";

export async function POST(req: Request) {
  try {
    const { roomId, msgId, reactions } = await req.json();

    if (!roomId || !msgId || !reactions) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const messages = await ensureMessagesCollection();

    await messages.updateOne(
      { roomId, id: msgId },
      { $set: { reactions } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[react]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}