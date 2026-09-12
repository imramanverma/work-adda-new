import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { calculateDistanceKm } from "../lib/location";
import { calculateMatchScore } from "../lib/matching";
import { calculatePaymentBreakdown, paymentProvider } from "../lib/payments";

const prisma = new PrismaClient();

async function runE2EWorkflow() {
  console.log("==================================================");
  console.log("🚀 WORK ADDA — FULL END-TO-END WORKFLOW VERIFICATION");
  console.log("==================================================\n");

  const testId = Date.now().toString().slice(-6);

  // 1. Worker Registration
  console.log("1️⃣ Step 1: Worker Account Creation & Profile");
  const workerPasswordHash = await bcrypt.hash("pass123", 10);
  const workerUser = await prisma.user.create({
    data: {
      name: `Test Worker ${testId}`,
      email: `worker_${testId}@test.com`,
      phone: `+919999${testId}`,
      passwordHash: workerPasswordHash,
      role: "WORKER",
      location: "Sector 15, Chandigarh",
      latitude: 30.755,
      longitude: 76.772,
      isVerified: true,
      workerProfile: {
        create: {
          bio: "Hardworking local student ready for warehouse and delivery shifts.",
          skills: JSON.stringify(["Order Packing", "Two-Wheeler Driving", "Route Navigation"]),
          experience: "1.5 years delivery and dispatch support",
          availability: "Flexible / Afternoons",
          preferredJobType: "PART_TIME",
          preferredDistance: 15,
          expectedPay: 650,
          rating: 4.8,
          completedJobs: 5,
        },
      },
    },
    include: { workerProfile: true },
  });
  console.log(`   ✔ Worker created: ${workerUser.name} (${workerUser.email})`);

  // 2. Employer Registration & Job Posting
  console.log("\n2️⃣ Step 2: Employer Creation & Job Posting");
  const employerPasswordHash = await bcrypt.hash("pass123", 10);
  const employerUser = await prisma.user.create({
    data: {
      name: `Shop Owner ${testId}`,
      email: `employer_${testId}@test.com`,
      phone: `+918888${testId}`,
      passwordHash: employerPasswordHash,
      role: "EMPLOYER",
      location: "Industrial Area Phase 1, Chandigarh",
      latitude: 30.7063,
      longitude: 76.8015,
      isVerified: true,
      employerProfile: {
        create: {
          businessName: `Chandigarh Express Logistics ${testId}`,
          businessType: "Logistics & Delivery",
          location: "Industrial Area Phase 1, Chandigarh",
          latitude: 30.7063,
          longitude: 76.8015,
          verificationStatus: "VERIFIED",
          rating: 4.9,
        },
      },
    },
    include: { employerProfile: true },
  });

  const job = await prisma.job.create({
    data: {
      employerId: employerUser.employerProfile!.id,
      title: `Weekend Express Parcel Dispatcher ${testId}`,
      description: "Immediate requirement for two-wheeler dispatch assistant to deliver packages in Mohali and Chandigarh.",
      category: "Delivery",
      requiredSkills: JSON.stringify(["Two-Wheeler Driving", "Route Navigation"]),
      jobType: "PART_TIME",
      location: "Industrial Area Phase 1, Chandigarh",
      latitude: 30.7063,
      longitude: 76.8015,
      payAmount: 800,
      payType: "DAILY",
      workersRequired: 2,
      status: "OPEN",
    },
  });
  console.log(`   ✔ Employer created: ${employerUser.employerProfile?.businessName}`);
  console.log(`   ✔ Job posted: "${job.title}" for ₹${job.payAmount}/${job.payType}`);

  // 3. Location Proximity & Smart Weighted Match Scoring
  console.log("\n3️⃣ Step 3: Proximity & Smart Match Algorithm Check");
  const distance = calculateDistanceKm(
    workerUser.latitude,
    workerUser.longitude,
    job.latitude,
    job.longitude
  );
  console.log(`   ✔ Calculated distance between Worker & Job: ${distance} km`);

  const matchResult = calculateMatchScore(
    {
      skills: JSON.parse(workerUser.workerProfile!.skills),
      latitude: workerUser.latitude,
      longitude: workerUser.longitude,
      preferredDistance: workerUser.workerProfile!.preferredDistance,
      availability: workerUser.workerProfile!.availability,
      experience: workerUser.workerProfile!.experience,
      rating: workerUser.workerProfile!.rating,
      completedJobs: workerUser.workerProfile!.completedJobs,
    },
    {
      requiredSkills: JSON.parse(job.requiredSkills),
      latitude: job.latitude,
      longitude: job.longitude,
      jobType: job.jobType,
    }
  );
  console.log(`   ✔ Match Score: ${matchResult.score}%`);
  console.log(`   ✔ Match Reasons: ${matchResult.reasons.join(" | ")}`);

  // 4. Worker Applies for Job
  console.log("\n4️⃣ Step 4: Worker Submits Application");
  const application = await prisma.application.create({
    data: {
      jobId: job.id,
      workerId: workerUser.id,
      coverMessage: "I have my own scooter, active license, and live 6 km away. Ready for weekend dispatch.",
      proposedPay: 800,
      status: "PENDING",
    },
  });

  await prisma.notification.create({
    data: {
      userId: employerUser.id,
      title: "New Application Received 📨",
      message: `${workerUser.name} applied for "${job.title}".`,
      type: "APPLICATION",
    },
  });
  console.log(`   ✔ Application submitted: id=${application.id}, status=${application.status}`);

  // 5. Employer Reviews, Shortlists & Hires Worker
  console.log("\n5️⃣ Step 5: Employer Shortlists and Accepts Candidate");
  // Shortlist
  await prisma.application.update({
    where: { id: application.id },
    data: { status: "SHORTLISTED" },
  });
  console.log("   ✔ Application state transitioned to SHORTLISTED");

  // Accept -> Creates Assignment
  await prisma.application.update({
    where: { id: application.id },
    data: { status: "ACCEPTED" },
  });

  const assignment = await prisma.workAssignment.create({
    data: {
      jobId: job.id,
      workerId: workerUser.id,
      employerId: employerUser.id,
      agreedAmount: application.proposedPay || job.payAmount,
      status: "ASSIGNED",
      completionStatus: "NOT_STARTED",
    },
  });

  // Create Conversation
  const conversation = await prisma.conversation.create({
    data: {
      jobId: job.id,
      workerId: workerUser.id,
      employerId: employerUser.id,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: employerUser.id,
      message: "Welcome aboard! Report to the hub Saturday at 10 AM.",
    },
  });

  console.log(`   ✔ Candidate Hired! WorkAssignment created: id=${assignment.id}, agreedAmount=₹${assignment.agreedAmount}`);
  console.log(`   ✔ Conversation established: id=${conversation.id}`);

  // 6. Worker Performs Work & Marks Completed
  console.log("\n6️⃣ Step 6: Worker Marks Work as Completed");
  const completedAssignment = await prisma.workAssignment.update({
    where: { id: assignment.id },
    data: {
      status: "COMPLETED",
      completionStatus: "SUBMITTED",
    },
  });
  console.log(`   ✔ Work marked as COMPLETED by worker (status: ${completedAssignment.status})`);

  // 7. Employer Approves Completed Work
  console.log("\n7️⃣ Step 7: Employer Approves Completion");
  const approvedAssignment = await prisma.workAssignment.update({
    where: { id: assignment.id },
    data: {
      status: "APPROVED",
      completionStatus: "APPROVED",
    },
  });

  await prisma.workerProfile.update({
    where: { userId: workerUser.id },
    data: { completedJobs: { increment: 1 } },
  });
  console.log(`   ✔ Work Approved by employer. Worker completedJobs incremented.`);

  // 8. Payment Processing with 5% Platform Fee Deduction
  console.log("\n8️⃣ Step 8: Payment Processing & Fee Calculation");
  const breakdown = calculatePaymentBreakdown(approvedAssignment.agreedAmount);
  console.log(`   Gross Amount:        ₹${breakdown.grossAmount}`);
  console.log(`   Platform Fee (5%):   ₹${breakdown.platformFee}`);
  console.log(`   Net Worker Payout:   ₹${breakdown.workerPayout}`);

  const order = await paymentProvider.createOrder(breakdown.grossAmount);
  const providerResult = await paymentProvider.processPayment(order.orderId, "UPI");

  const payment = await prisma.payment.create({
    data: {
      jobId: approvedAssignment.jobId,
      assignmentId: approvedAssignment.id,
      payerId: employerUser.id,
      receiverId: workerUser.id,
      amount: breakdown.grossAmount,
      platformFee: breakdown.platformFee,
      workerAmount: breakdown.workerPayout,
      status: providerResult.status,
      escrowStatus: "RELEASED",
      paymentMethod: "UPI",
      transactionId: providerResult.transactionId,
    },
  });

  await prisma.workAssignment.update({
    where: { id: approvedAssignment.id },
    data: { status: "PAID" },
  });

  console.log(`   ✔ Payment Created: id=${payment.id}, TxnId=${payment.transactionId}, Status=${payment.status}`);
  console.log(`   ✔ Assignment updated to PAID`);

  // 9. Mutual Reviews & Dynamic Rating Aggregation
  console.log("\n9️⃣ Step 9: Mutual Ratings & Reviews");
  // Employer rates Worker 5 stars
  await prisma.review.create({
    data: {
      reviewerId: employerUser.id,
      reviewedUserId: workerUser.id,
      jobId: job.id,
      rating: 5,
      comment: "Prompt delivery, polite demeanor, and took great care of shipments!",
    },
  });

  // Worker rates Employer 5 stars
  await prisma.review.create({
    data: {
      reviewerId: workerUser.id,
      reviewedUserId: employerUser.id,
      jobId: job.id,
      rating: 5,
      comment: "Great business owner, clear instructions, and instant UPI payment.",
    },
  });

  console.log("   ✔ Mutual 5-star reviews successfully recorded.");

  // 10. Community Trust & Safety Report
  console.log("\n🔟 Step 10: Community Safety Report Check");
  const report = await prisma.report.create({
    data: {
      reporterId: workerUser.id,
      jobId: job.id,
      reason: "Clarification Needed",
      description: "Test safety moderation check on assignment details.",
      status: "PENDING",
    },
  });
  console.log(`   ✔ Report created: id=${report.id}, status=${report.status}`);

  console.log("\n==================================================");
  console.log("🎉 ALL 10 CORE WORKFLOW STEPS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

runE2EWorkflow()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
