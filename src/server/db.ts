import { seed, type Database } from "./seed";

// Keep one in-memory database per server process (and across hot reloads in development).
const globalForDb = globalThis as unknown as { __medbridgeDb?: Database };

export function db(): Database {
  if (!globalForDb.__medbridgeDb) globalForDb.__medbridgeDb = seed();
  return globalForDb.__medbridgeDb;
}
