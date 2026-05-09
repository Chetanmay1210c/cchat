// app/api/chat/save/route.ts
import { NextResponse } from "next/server";
import { ensureMessagesCollection } from "@/lib/ensureCollections";

export async function POST(req: Request) {
  try {
    const { roomId, message } = await req.json();

    if (!roomId || !message) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const messages = await ensureMessagesCollection();

    await messages.insertOne({
      roomId,
      id: message.id,
      text: message.text,
      sender: message.sender,
      createdAt: message.createdAt,
      reactions: message.reactions ?? [],
      edited: false,
      deleted: false,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[save]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}