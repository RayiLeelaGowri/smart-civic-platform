import pg from "pg";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured.");
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", {
    message: error?.message,
    code: error?.code,
    detail: error?.detail,
    stack: error?.stack,
  });
});

export default pool;