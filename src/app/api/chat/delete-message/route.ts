// app/api/chat/delete-message/route.ts
// Soft-deletes a single message — sets deleted:true so the UI shows
// "This message was deleted" instead of removing the bubble entirely.
import { NextResponse } from "next/server";
import { ensureMessagesCollection } from "@/lib/ensureCollections";

export async function POST(req: Request) {
  try {
    const { roomId, msgId } = await req.json();

    if (!roomId || !msgId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const messages = await ensureMessagesCollection();

    await messages.updateOne(
      { roomId, id: msgId },
      { $set: { deleted: true } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delete-message]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}