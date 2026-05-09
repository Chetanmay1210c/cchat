// app/api/chat/delete/route.ts
// Deletes the room + all its messages + removes partner links from both users.
// The chat page only sends { roomId } — we look up usernames from the rooms collection.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureMessagesCollection } from "@/lib/ensureCollections";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { roomId } = await req.json();

    if (!roomId) {
      return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
    }

    const rooms   = db.collection("rooms");
    const users   = db.collection("users");
    const messages = await ensureMessagesCollection();

    // ── 1. Find the room to get both usernames ─────────────────────────────
    const room = await rooms.findOne({ roomId });

    if (!room) {
      // Room already gone – still clean up messages and return success
      await messages.deleteMany({ roomId });
      return NextResponse.json({ success: true });
    }

    const [user1, user2]: string[] = room.users ?? [];

    // ── 2. Delete all messages ─────────────────────────────────────────────
    await messages.deleteMany({ roomId });

    // ── 3. Delete the room document ────────────────────────────────────────
    await rooms.deleteOne({ roomId });

    // ── 4. Remove partner link from user1 ──────────────────────────────────
    if (user1) {
      const u1 = await users.findOne({ username: user1 });
      if (u1) {
        const updatedPartners = (u1.partners ?? []).filter(
          (p: any) => p.username !== user2
        );
        await users.updateOne(
          { _id: u1._id },
          { $set: { partners: updatedPartners } }
        );
      }
    }

    // ── 5. Remove partner link from user2 ──────────────────────────────────
    if (user2) {
      const u2 = await users.findOne({ username: user2 });
      if (u2) {
        const updatedPartners = (u2.partners ?? []).filter(
          (p: any) => p.username !== user1
        );
        await users.updateOne(
          { _id: u2._id },
          { $set: { partners: updatedPartners } }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delete]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}