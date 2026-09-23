import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Looking for seeded demo jobs with 'seedBatch: demo-v1' or 'isDemo: true'...");

  // Find all jobs where categoryDetails contains isDemo: true
  const allJobs = await prisma.job.findMany({
    select: { id: true, title: true, categoryDetails: true },
  });

  const demoJobIds: string[] = [];
  for (const job of allJobs) {
    if (job.categoryDetails && job.categoryDetails.includes("isDemo")) {
      demoJobIds.push(job.id);
    }
  }

  if (demoJobIds.length === 0) {
    console.log("ℹ️ No demo jobs found to remove.");
    return;
  }

  console.log(`Found ${demoJobIds.length} demo jobs to remove.`);

  const res = await prisma.job.deleteMany({
    where: { id: { in: demoJobIds } },
  });

  console.log(`✅ Successfully removed ${res.count} demo jobs from the database!`);
}

main()
  .catch((e) => {
    console.error("❌ Removal failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
