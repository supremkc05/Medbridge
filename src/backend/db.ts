import { seed, type Database } from "./seed";

// One in-memory data store per browser tab (kept on globalThis so it survives hot reloads).
const globalForDb = globalThis as unknown as { __medbridgeDb?: Database };

export function db(): Database {
  if (!globalForDb.__medbridgeDb) globalForDb.__medbridgeDb = seed();
  return globalForDb.__medbridgeDb;
}
