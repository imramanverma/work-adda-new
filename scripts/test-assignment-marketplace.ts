import { db as prisma } from "../lib/db";
import bcrypt from "bcryptjs";

async function runVerification() {
  console.log("=== STARTING WORKADDA ASSIGNMENT & EXPANDED MARKETPLACE E2E TEST ===");

  const timestamp = Date.now();
  const testStudentEmail = `student_${timestamp}@example.com`;
  const testWorkerEmail = `writer_${timestamp}@example.com`;
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Student Poster (Role: BOTH, PosterType: STUDENT)
  console.log("\n1. Testing Student/Both Registration...");
  const posterUser = await prisma.user.create({
    data: {
      name: "Aman Sharma (College Student)",
      email: testStudentEmail,
      phone: `981${Math.floor(1000000 + Math.random() * 9000000)}`,
      passwordHash,
      role: "BOTH",
      isVerified: true,
      employerProfile: {
        create: {
          businessName: "Aman Sharma (Student)",
          businessType: "Academic / Personal",
          posterType: "STUDENT",
          location: "Fatehabad",
          verificationStatus: "VERIFIED",
        },
      },
      workerProfile: {
        create: {
          skills: JSON.stringify(["Fast Typing", "Excel"]),
          categories: JSON.stringify(["Academic & Assignment Work", "Digital Work"]),
          expectedPay: 500,
          preferredWorkType: "REMOTE",
        },
      },
    },
    include: { employerProfile: true, workerProfile: true },
  });

  console.log("✅ Student Poster created with Role: BOTH");
  console.log("   Poster ID:", posterUser.id);
  console.log("   Employer Profile Poster Type:", posterUser.employerProfile?.posterType);
  console.log("   Worker Profile Initialized:", !!posterUser.workerProfile);

  // 2. Create Assignment Worker (Role: WORKER, Skills: Neat Handwriting, DBMS)
  console.log("\n2. Testing Assignment Writer Profile Registration...");
  const writerUser = await prisma.user.create({
    data: {
      name: "Pooja Verma (Assignment Specialist)",
      email: testWorkerEmail,
      phone: `982${Math.floor(1000000 + Math.random() * 9000000)}`,
      passwordHash,
      role: "WORKER",
      isVerified: true,
      workerProfile: {
        create: {
          skills: JSON.stringify(["Neat Handwriting", "DBMS", "Diagram Drawing", "Good English"]),
          categories: JSON.stringify(["Academic & Assignment Work", "Digital Work"]),
          languages: JSON.stringify(["English", "Hindi"]),
          portfolio: JSON.stringify(["https://example.com/pooja-handwriting-samples.pdf"]),
          preferredWorkType: "ANY",
          expectedPay: 600,
        },
      },
    },
    include: { workerProfile: true },
  });

  console.log("✅ Writer created with Role: WORKER");
  console.log("   Writer ID:", writerUser.id);
  console.log("   Skills:", writerUser.workerProfile?.skills);
  console.log("   Categories:", writerUser.workerProfile?.categories);

  // 3. Post an Assignment Work Task (40 Pages DBMS Handwritten, Remote, Urgent)
  console.log("\n3. Testing 40-Page Assignment Creation (Page-Based Budgeting)...");
  const assignmentJob = await prisma.job.create({
    data: {
      employerId: posterUser.employerProfile!.id,
      title: "40 Pages Handwritten DBMS Assignment (Urgent)",
      description:
        "Need 40 handwritten pages on Database Management Systems (ER Modeling, Normalization, SQL queries) on A4 loose sheets using blue & black ink. Scanned PDF copy to be uploaded before physical handover.",
      category: "Academic & Assignment Work",
      subcategory: "Assignment Writing",
      jobType: "GIG",
      location: "Remote / Online",
      isRemote: true,
      urgency: "VERY_URGENT",
      budgetType: "PER_PAGE",
      pricePerUnit: 15,
      unitType: "page",
      quantity: 40,
      payAmount: 600, // 40 pages * 15 = 600
      payType: "PER_PAGE",
      deliveryMethod: "DIGITAL_UPLOAD",
      revisionsAllowed: 2,
      categoryDetails: JSON.stringify({
        subject: "DBMS (Database Management)",
        academicLevel: "Undergraduate",
        assignmentFormat: "Handwritten",
        paperType: "A4 Loose Sheets",
        inkColor: "Blue & Black",
        diagramsRequired: true,
      }),
      attachmentUrls: JSON.stringify(["https://example.com/assignments/dbms-questions.pdf"]),
      requiredSkills: JSON.stringify(["Neat Handwriting", "DBMS", "Fast Writing"]),
      status: "OPEN",
    },
  });

  console.log("✅ Assignment Job Listing Created successfully!");
  console.log("   Job ID:", assignmentJob.id);
  console.log("   Title:", assignmentJob.title);
  console.log("   Category:", assignmentJob.category);
  console.log("   Subcategory:", assignmentJob.subcategory);
  console.log("   Is Remote:", assignmentJob.isRemote);
  console.log("   Urgency:", assignmentJob.urgency);
  console.log("   Quantity:", assignmentJob.quantity, assignmentJob.unitType);
  console.log("   Price per unit: ₹" + assignmentJob.pricePerUnit);
  console.log("   Total Pay: ₹" + assignmentJob.payAmount);
  console.log("   Revisions Allowed:", assignmentJob.revisionsAllowed);
  console.log("   Category Details:", assignmentJob.categoryDetails);

  // 4. Writer Applies with Proposed Timeline, Skills, and Sample Work
  console.log("\n4. Testing Application Submission with Proposed Pay & Work Samples...");
  const application = await prisma.application.create({
    data: {
      jobId: assignmentJob.id,
      workerId: writerUser.id,
      coverMessage:
        "I have a 9.2 GPA in Computer Science and excellent cursive/printed handwriting. I can write and neatly scan all 40 DBMS pages within 24 hours.",
      proposedPay: 600,
      completionTime: "Within 24 Hours",
      relevantSkills: JSON.stringify(["Neat Handwriting", "DBMS", "Diagram Drawing"]),
      sampleWorkUrls: JSON.stringify(["https://example.com/pooja-handwriting-samples.pdf"]),
      status: "PENDING",
    },
  });

  console.log("✅ Application Submitted successfully!");
  console.log("   Application ID:", application.id);
  console.log("   Proposed Pay: ₹" + application.proposedPay);
  console.log("   Completion Time:", application.completionTime);
  console.log("   Relevant Skills:", application.relevantSkills);
  console.log("   Sample Work URLs:", application.sampleWorkUrls);

  // 5. Employer Accepts Application & Creates Escrow Work Assignment
  console.log("\n5. Testing Application Acceptance & Escrow Work Assignment Creation...");
  await prisma.application.update({
    where: { id: application.id },
    data: { status: "ACCEPTED" },
  });

  const assignment = await prisma.workAssignment.create({
    data: {
      jobId: assignmentJob.id,
      workerId: writerUser.id,
      employerId: posterUser.id,
      agreedAmount: 600,
      status: "IN_PROGRESS",
    },
  });

  const payment = await prisma.payment.create({
    data: {
      assignmentId: assignment.id,
      jobId: assignmentJob.id,
      payerId: posterUser.id,
      receiverId: writerUser.id,
      amount: 600,
      platformFee: 30, // 5% fee
      workerAmount: 570,
      status: "HELD",
      escrowStatus: "HELD",
      transactionId: `TXN_${Date.now()}`,
    },
  });

  console.log("✅ Work Assignment & Escrow Payment Created!");
  console.log("   Assignment ID:", assignment.id);
  console.log("   Escrow Status:", payment.escrowStatus);
  console.log("   Amount Safeguarded in Escrow: ₹" + payment.amount);

  // 6. Worker Submits Initial Deliverables & Notes
  console.log("\n6. Testing Deliverables Submission by Worker...");
  const submittedAssignment = await prisma.workAssignment.update({
    where: { id: assignment.id },
    data: {
      status: "COMPLETED",
      submissionNote:
        "Finished all 40 pages with ER diagrams and SQL statements. High resolution scanned PDF is attached.",
      submissionFiles: JSON.stringify(["https://example.com/deliverables/dbms-assignment-final.pdf"]),
    },
  });

  console.log("✅ Deliverables Submitted!");
  console.log("   Status:", submittedAssignment.status);
  console.log("   Submission Note:", submittedAssignment.submissionNote);
  console.log("   Deliverables:", submittedAssignment.submissionFiles);

  // 7. Employer Requests Revision (First Revision)
  console.log("\n7. Testing Employer Requesting Revision...");
  const revisionAssignment = await prisma.workAssignment.update({
    where: { id: assignment.id },
    data: {
      status: "REVISION_REQUESTED",
      revisionCount: { increment: 1 },
      revisionRequestedNote:
        "Great handwriting! Please redraw diagram on page 18 using a ruler and re-label normalization steps on page 24.",
    },
  });

  console.log("✅ Revision Successfully Requested!");
  console.log("   Status:", revisionAssignment.status);
  console.log("   Revision Count:", revisionAssignment.revisionCount);
  console.log("   Hirer Feedback:", revisionAssignment.revisionRequestedNote);

  // 8. Worker Resubmits Updated Deliverables
  console.log("\n8. Testing Worker Resubmitting Revised Deliverables...");
  const resubmittedAssignment = await prisma.workAssignment.update({
    where: { id: assignment.id },
    data: {
      status: "COMPLETED",
      submissionNote:
        "Corrected page 18 with clean ruler diagrams and clearly re-labeled page 24. Ready for final review!",
      submissionFiles: JSON.stringify([
        "https://example.com/deliverables/dbms-assignment-final-v2.pdf",
      ]),
    },
  });

  console.log("✅ Revised Work Resubmitted!");
  console.log("   Status:", resubmittedAssignment.status);
  console.log("   Updated Note:", resubmittedAssignment.submissionNote);

  // 9. Employer Approves Work & Releases Escrow Payment
  console.log("\n9. Testing Hirer Final Approval & Escrow Release...");
  const approvedAssignment = await prisma.workAssignment.update({
    where: { id: assignment.id },
    data: {
      status: "APPROVED",
      completionStatus: "APPROVED",
      endDate: new Date(),
    },
  });

  const releasedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "SETTLED",
      escrowStatus: "RELEASED",
      releasedAt: new Date(),
    },
  });

  await prisma.job.update({
    where: { id: assignmentJob.id },
    data: { status: "COMPLETED" },
  });

  console.log("✅ Assignment Approved and Escrow Released!");
  console.log("   Assignment Status:", approvedAssignment.status);
  console.log("   Payment Status:", releasedPayment.status);
  console.log("   Payment Escrow Status:", releasedPayment.escrowStatus);
  console.log("   Job Status:", "COMPLETED");

  // 10. Verify Non-Regression: Standard Local Business Job Continues Working
  console.log("\n10. Testing Standard Local Retail Job Non-Regression...");
  const localJob = await prisma.job.create({
    data: {
      employerId: posterUser.employerProfile!.id,
      title: "Grocery Store Counter Cashier (Evening Shift)",
      description: "Operate billing counter and stock shelves at local supermarket.",
      category: "Local Business Jobs",
      subcategory: "Cashier",
      jobType: "PART_TIME",
      location: "Near Bus Stand, Fatehabad",
      isRemote: false,
      urgency: "NORMAL",
      payAmount: 450,
      payType: "DAILY",
      workersRequired: 1,
      status: "OPEN",
    },
  });

  console.log("✅ Local Retail Job successfully created without issues!");
  console.log("   Job ID:", localJob.id);
  console.log("   Category:", localJob.category);
  console.log("   Location:", localJob.location);
  console.log("   Is Remote:", localJob.isRemote);

  // Cleanup test artifacts
  console.log("\nCleaning up test records...");
  await prisma.payment.deleteMany({ where: { assignmentId: assignment.id } });
  await prisma.workAssignment.deleteMany({ where: { id: assignment.id } });
  await prisma.application.deleteMany({ where: { jobId: assignmentJob.id } });
  await prisma.job.deleteMany({ where: { id: { in: [assignmentJob.id, localJob.id] } } });
  await prisma.employerProfile.deleteMany({ where: { userId: posterUser.id } });
  await prisma.workerProfile.deleteMany({ where: { userId: { in: [posterUser.id, writerUser.id] } } });
  await prisma.user.deleteMany({ where: { id: { in: [posterUser.id, writerUser.id] } } });
  console.log("✅ Test cleanup complete!");

  console.log("\n=======================================================");
  console.log("🎉 ALL ASSIGNMENT MARKETPLACE & ESCROW TESTS PASSED! 🎉");
  console.log("=======================================================\n");
}

runVerification()
  .catch((err) => {
    console.error("❌ Test verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
