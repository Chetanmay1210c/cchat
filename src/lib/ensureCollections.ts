// lib/ensureCollections.ts
// AstraDB (Data API) requires collections to exist before you can use them.
// Call ensureMessagesCollection() at the top of every /api/chat/* route.

import { db } from "@/lib/db";

let messagesReady = false; // in-process cache so we only create once per cold start

export async function ensureMessagesCollection() {
  // ── Build Guard Clause ──────────────────────────────────────────────────
  // If the Astra DB endpoint is missing from the environment (Vercel Build Phase),
  // return a mock object so the compiler finishes successfully without throwing.
  if (!process.env.ASTRA_DB_API_ENDPOINT || !process.env.ASTRA_DB_APPLICATION_TOKEN) {
    console.warn("⚠️ Astra DB credentials missing. Bypassing execution for build worker.");
    return {
      deleteMany: async () => ({ deletedCount: 0 }),
      insertOne: async () => ({ insertedId: "mock-id" }),
      find: () => ({ toArray: async () => [] }),
    } as any;
  }

  // ── Live Runtime Logic ──────────────────────────────────────────────────
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