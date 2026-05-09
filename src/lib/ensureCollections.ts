// lib/ensureCollections.ts
// AstraDB (Data API) requires collections to exist before you can use them.
// Call ensureMessagesCollection() at the top of every /api/chat/* route.

import { db } from "@/lib/db";

let messagesReady = false; // in-process cache so we only create once per cold start

export async function ensureMessagesCollection() {
  if (messagesReady) return db.collection("messages");

  try {
    // createCollection is idempotent – safe to call even if it already exists
    await db.createCollection("messages");
  } catch (err: any) {
    // AstraDB throws if the collection already exists; that's fine
    const msg: string = err?.message ?? "";
    if (!msg.includes("already exists") && !msg.includes("already exist")) {
      throw err;
    }
  }

  messagesReady = true;
  return db.collection("messages");
}