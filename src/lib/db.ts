// lib/db.ts
import { DataAPIClient } from "@datastax/astra-db-ts";

const token = process.env.ASTRA_DB_APPLICATION_TOKEN;
const endpoint = process.env.ASTRA_DB_API_ENDPOINT;

// Structural fallback object to satisfy the Next.js build engine
const mockDb = {
  collection: () => ({
    deleteMany: async () => ({ deletedCount: 0 }),
    insertOne: async () => ({ insertedId: "mock-id" }),
    updateOne: async () => ({ modifiedCount: 0 }),
    find: () => ({ toArray: async () => [] }),
  }),
  createCollection: async () => {},
};

// ── Build Guard Clause ──────────────────────────────────────────────────
// If env tokens are missing (Vercel Build Phase), export the mock container.
// At live runtime on Vercel, this executes the genuine Astra client seamlessly.
export const db = (!token || !endpoint)
  ? (mockDb as any)
  : new DataAPIClient(token).db(endpoint);