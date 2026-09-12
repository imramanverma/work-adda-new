import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getSanitizedDatabaseUrl(): string {
  let url =
    process.env.DATABASE_URL ||
    "postgresql://postgres.ickyowokhescgvxzpwnc:Ramanverma%4031@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20";

  // Automatically upgrade Supabase pooler from port 5432 (Session mode with 15 client limit) to port 6543 (Transaction mode)
  if (url.includes(".pooler.supabase.com:5432")) {
    url = url.replace(".pooler.supabase.com:5432", ".pooler.supabase.com:6543");
  }

  // Ensure pgbouncer=true query parameter is present for Supabase pooler
  if (url.includes(".pooler.supabase.com") && !url.includes("pgbouncer=true")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}pgbouncer=true`;
  }

  // Optimize connection limit and pool timeout for serverless environments
  if (url.includes(".pooler.supabase.com") && !url.includes("connection_limit=")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}connection_limit=10&pool_timeout=20`;
  }

  return url;
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getSanitizedDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

globalForPrisma.prisma = db;
