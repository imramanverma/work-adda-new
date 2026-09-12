import fs from "fs";
import path from "path";

const SCHEMA_PATH = path.join(process.cwd(), "prisma", "schema.prisma");

const targetProvider = process.argv[2]?.toLowerCase();

if (!targetProvider || !["postgres", "postgresql", "sqlite"].includes(targetProvider)) {
  console.log(`
Usage:
  npx tsx scripts/prepare-deploy.ts postgres    # Switch schema to PostgreSQL for deployment
  npx tsx scripts/prepare-deploy.ts sqlite      # Switch schema to SQLite for local development
  `);
  process.exit(1);
}

let content = fs.readFileSync(SCHEMA_PATH, "utf-8");

if (targetProvider === "sqlite") {
  content = content.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  console.log("✅ Switched prisma/schema.prisma to: provider = \"sqlite\"");
} else {
  content = content.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  console.log("✅ Switched prisma/schema.prisma to: provider = \"postgresql\" (Ready for Vercel / Neon / Supabase / Render / Railway)");
}

fs.writeFileSync(SCHEMA_PATH, content, "utf-8");
console.log("🚀 Done! Next steps: run `npx prisma generate` and commit changes.");
