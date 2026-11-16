import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const globalForPool = globalThis as typeof globalThis & { campusEatsPool?: Pool }

export const pool = globalForPool.campusEatsPool ?? new Pool({ connectionString: process.env.DATABASE_URL })
if (process.env.NODE_ENV !== "production") globalForPool.campusEatsPool = pool

export const db = drizzle(pool, { schema })
