import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AUTHENTIC_EMAILS = [
  "vermaraman87084@gmail.com",
  "kumarnitinjcd8167@gmail.com",
  "robinrukhaya12@gmail.com",
  "rameshkumarverma050@gmail.com",
  "robinrukhaya54@gmail.com",
  "ramanverma2007@gmail.com",
  "admin@workadda.com",
];

async function main() {
  console.log("🔍 Scanning for test/fake users and jobs...");

  const fakeUsers = await prisma.user.findMany({
    where: {
      email: {
        notIn: AUTHENTIC_EMAILS,
      },
    },
    select: { id: true, email: true, name: true },
  });

  console.log(`Found ${fakeUsers.length} non-authentic/test users:`);
  for (const u of fakeUsers) {
    console.log(` - ${u.name} (${u.email}) [${u.id}]`);
  }

  for (const u of fakeUsers) {
    console.log(`Deleting ${u.email}...`);
    // Delete jobs posted by this user first
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId: u.id },
    });
    if (employerProfile) {
      await prisma.job.deleteMany({
        where: { employerId: employerProfile.id },
      });
    }

    // Delete user (Prisma cascade onDelete takes care of related profiles, payments, applications, etc.)
    await prisma.user.delete({
      where: { id: u.id },
    });
    console.log(`✔ Deleted user ${u.email}`);
  }

  // Double check any leftover jobs that are not owned by authentic users
  const authenticEmployerProfiles = await prisma.employerProfile.findMany({
    where: {
      user: {
        email: { in: AUTHENTIC_EMAILS },
      },
    },
    select: { id: true },
  });
  const authenticEmployerIds = authenticEmployerProfiles.map((p) => p.id);

  const orphanedJobs = await prisma.job.deleteMany({
    where: {
      employerId: { notIn: authenticEmployerIds },
    },
  });
  if (orphanedJobs.count > 0) {
    console.log(`✅ Cleaned up ${orphanedJobs.count} orphaned/unaffiliated jobs.`);
  }

  const remainingJobs = await prisma.job.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      employer: { select: { businessName: true, user: { select: { email: true, name: true } } } },
    },
  });
  console.log(`\n📋 Current Authentic Jobs in Database (${remainingJobs.length}):`);
  console.dir(remainingJobs, { depth: null });

  const remainingUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });
  console.log(`\n👥 Current Authentic Users in Database (${remainingUsers.length}):`);
  console.dir(remainingUsers, { depth: null });
}

main()
  .catch((e) => {
    console.error("Error during cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
