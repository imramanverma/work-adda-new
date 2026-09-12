import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function cleanSlate() {
  console.log("🧹 Starting database cleanup: Removing all fake/seeded demo data...");

  // Delete all transactional and fabricated activity in dependency order
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.workAssignment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.otpVerification.deleteMany();

  // Delete all users except ADMIN
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      role: { not: "ADMIN" },
    },
  });
  console.log(`✅ Deleted ${deletedUsers.count} fake demo users.`);

  // Ensure Admin user exists
  const defaultPasswordHash = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@workadda.com" },
    update: {
      isVerified: true,
      phoneVerified: true,
    },
    create: {
      name: "Work Adda Admin",
      email: "admin@workadda.com",
      phone: "+919876500000",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
      isVerified: true,
      phoneVerified: true,
      location: "Fatehabad",
      latitude: 29.5186,
      longitude: 75.4542,
    },
  });
  console.log(`✅ Verified Admin account: ${admin.email}`);

  // Count remaining records to verify clean state
  const remainingUsers = await prisma.user.count();
  const remainingJobs = await prisma.job.count();
  const remainingReviews = await prisma.review.count();
  const remainingSkills = await prisma.skill.count();

  console.log("📊 Clean State Verification:", {
    remainingUsers,
    remainingJobs,
    remainingReviews,
    masterSkillsCount: remainingSkills,
  });
  console.log("🎉 Database is now 100% clean and ready for real users and real jobs!");
}

cleanSlate()
  .catch((e) => {
    console.error("Cleanup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
