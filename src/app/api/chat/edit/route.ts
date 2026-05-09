// app/api/chat/edit/route.ts
// Updates the text of a single message and marks it as edited.
import { NextResponse } from "next/server";
import { ensureMessagesCollection } from "@/lib/ensureCollections";

export async function POST(req: Request) {
  try {
    const { roomId, msgId, text } = await req.json();

    if (!roomId || !msgId || !text) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const messages = await ensureMessagesCollection();

    await messages.updateOne(
      { roomId, id: msgId },
      { $set: { text, edited: true } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[edit]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}