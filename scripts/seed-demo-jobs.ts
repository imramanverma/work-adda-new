import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Work Adda demo jobs seeding across Fatehabad, Sirsa & Hisar...");

  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  // 1. Ensure realistic demo employers exist in Fatehabad, Sirsa, and Hisar
  const employersData = [
    {
      email: "sharma.stationery.hisar@workadda.com",
      phone: "+919811100001",
      name: "Ramesh Sharma",
      role: "EMPLOYER",
      location: "Hisar",
      latitude: 29.1492,
      longitude: 75.7217,
      posterType: "STUDENT",
      businessName: "GJU Student Hub & Stationery",
      businessType: "Academic Services & Printing",
      address: "Near Guru Jambheshwar University Gate 2, Hisar",
      rating: 4.9,
    },
    {
      email: "aggarwal.cloth.ftb@workadda.com",
      phone: "+919811100002",
      name: "Suresh Aggarwal",
      role: "EMPLOYER",
      location: "Fatehabad",
      latitude: 29.5186,
      longitude: 75.4542,
      posterType: "SHOP_OWNER",
      businessName: "Aggarwal Cloth House",
      businessType: "Retail Textile & Garments",
      address: "Main Cloth Market, DSP Road, Fatehabad",
      rating: 4.8,
    },
    {
      email: "kisan.agro.sirsa@workadda.com",
      phone: "+919811100003",
      name: "Balvinder Singh",
      role: "EMPLOYER",
      location: "Sirsa",
      latitude: 29.5334,
      longitude: 75.0177,
      posterType: "COMPANY",
      businessName: "Kisan Agro Logistics & Mart",
      businessType: "Logistics & Local Supply",
      address: "Bhadra Bazar / Anaj Mandi, Sirsa",
      rating: 5.0,
    },
  ];

  const employerProfiles: Record<string, string> = {};

  for (const emp of employersData) {
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {
        name: emp.name,
        phone: emp.phone,
        location: emp.location,
        latitude: emp.latitude,
        longitude: emp.longitude,
        isVerified: true,
        phoneVerified: true,
      },
      create: {
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        passwordHash: defaultPasswordHash,
        role: emp.role,
        location: emp.location,
        latitude: emp.latitude,
        longitude: emp.longitude,
        isVerified: true,
        phoneVerified: true,
      },
    });

    const profile = await prisma.employerProfile.upsert({
      where: { userId: user.id },
      update: {
        businessName: emp.businessName,
        businessType: emp.businessType,
        posterType: emp.posterType,
        location: emp.location,
        address: emp.address,
        latitude: emp.latitude,
        longitude: emp.longitude,
        verificationStatus: "VERIFIED",
        rating: emp.rating,
      },
      create: {
        userId: user.id,
        businessName: emp.businessName,
        businessType: emp.businessType,
        posterType: emp.posterType,
        location: emp.location,
        address: emp.address,
        latitude: emp.latitude,
        longitude: emp.longitude,
        verificationStatus: "VERIFIED",
        rating: emp.rating,
      },
    });

    employerProfiles[emp.location] = profile.id;
    console.log(`✅ Verified Demo Employer in ${emp.location}: ${emp.businessName}`);
  }

  // 2. Define 14 High-Quality Demo Jobs across all categories in Haryana
  const demoJobs = [
    // 📚 Academic & Assignment Work (Hisar & Fatehabad)
    {
      title: "DBMS Handwritten Lab Manual & ER Diagrams (35 Pages)",
      description:
        "Need a neat handwriting writer for 35 pages of Database Management Systems practical records including 4 ER diagrams on A4 ruled sheets with blue/black pen. Lab questions and sample schema will be provided via PDF.",
      category: "Academic & Assignment Work",
      subcategory: "Practical File Writing",
      employerId: employerProfiles["Hisar"],
      location: "Hisar",
      latitude: 29.1492,
      longitude: 75.7217,
      isRemote: true,
      urgency: "URGENT",
      budgetType: "PER_PAGE",
      pricePerUnit: 4.0,
      unitType: "PAGE",
      quantity: 35,
      payAmount: 140,
      payType: "FIXED",
      jobType: "GIG",
      workersRequired: 1,
      requiredSkills: JSON.stringify(["Handwritten Assignment", "DBMS", "Diagram Drawing"]),
      categoryDetails: JSON.stringify({
        isDemo: true,
        seedBatch: "demo-v1",
        subject: "DBMS",
        academicLevel: "Undergraduate",
        assignmentFormat: "Handwritten",
        paperType: "A4 Ruled Sheets",
        inkColor: "Blue & Black",
      }),
    },
    {
      title: "B.Com Business Law Assignment Notes Compilation",
      description:
        "Looking for a college student or typist to compile 25 pages of concise Business Law revision notes from textbook chapters into clean PDF format. Prompt escrow release upon review.",
      category: "Academic & Assignment Work",
      subcategory: "Notes Writing",
      employerId: employerProfiles["Fatehabad"],
      location: "Fatehabad",
      latitude: 29.5186,
      longitude: 75.4542,
      isRemote: true,
      urgency: "NORMAL",
      budgetType: "PER_PAGE",
      pricePerUnit: 4.0,
      unitType: "PAGE",
      quantity: 25,
      payAmount: 100,
      payType: "FIXED",
      jobType: "GIG",
      workersRequired: 1,
      requiredSkills: JSON.stringify(["Word Formatting", "Notes Writing", "Commerce"]),
      categoryDetails: JSON.stringify({
        isDemo: true,
        seedBatch: "demo-v1",
        subject: "Business Law",
        academicLevel: "Undergraduate",
        assignmentFormat: "Typed",
      }),
    },

    // 🏪 Local Business & Retail Jobs (Fatehabad, Sirsa, Hisar)
    {
      title: "Counter Sales & Billing Assistant (Garment Showroom)",
      description:
        "Seeking an active counter salesperson for evening customer assistance and barcode billing during peak shopping hours. Polite communication and basic smartphone/computer familiarity required.",
      category: "Local Business Jobs",
      subcategory: "Salesperson",
      employerId: employerProfiles["Fatehabad"],
      location: "Fatehabad",
      latitude: 29.5186,
      longitude: 75.4542,
      isRemote: false,
      urgency: "NORMAL",
      budgetType: "DAILY",
      payAmount: 450,
      payType: "DAILY",
      jobType: "PART_TIME",
      workersRequired: 2,
      requiredSkills: JSON.stringify(["Counter Sales", "Customer Service", "Billing & Cashiering"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1" }),
    },
    {
      title: "Retail Store Inventory & Shelf Stocking Helper",
      description:
        "Need 1 helper for organizing newly arrived stock, unpacking boxes, and arranging retail shelves in Bhadra Bazar, Sirsa. Shift: 10:00 AM to 6:00 PM with lunch provided.",
      category: "Local Business Jobs",
      subcategory: "Stock Manager",
      employerId: employerProfiles["Sirsa"],
      location: "Sirsa",
      latitude: 29.5334,
      longitude: 75.0177,
      isRemote: false,
      urgency: "NORMAL",
      budgetType: "DAILY",
      payAmount: 400,
      payType: "DAILY",
      jobType: "TEMPORARY",
      workersRequired: 1,
      requiredSkills: JSON.stringify(["Inventory Stocking", "Order Packing", "Store Display Setup"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1" }),
    },

    // 💻 Digital & Computer Work (Remote / Local)
    {
      title: "Canva Social Media Poster & Festival Banner Design",
      description:
        "Create 5 attractive promotional flyers and Instagram story banners for our local business. Brand logo, color palette, and promo offers will be shared on chat. Fast turnaround preferred.",
      category: "Digital Work",
      subcategory: "Graphic Design",
      employerId: employerProfiles["Hisar"],
      location: "Hisar",
      latitude: 29.1492,
      longitude: 75.7217,
      isRemote: true,
      urgency: "URGENT",
      budgetType: "FIXED",
      payAmount: 350,
      payType: "FIXED",
      jobType: "GIG",
      workersRequired: 1,
      requiredSkills: JSON.stringify(["Graphic Design", "Canva", "Social Media Posting"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1" }),
    },
    {
      title: "Excel Stock Ledger Data Entry & Price List Formatting",
      description:
        "Input approximately 200 items from handwritten store invoices into a provided Excel template with columns for Item Name, MRP, Discount, and Final Rate. Remote task.",
      category: "Digital Work",
      subcategory: "Excel",
      employerId: employerProfiles["Sirsa"],
      location: "Sirsa",
      latitude: 29.5334,
      longitude: 75.0177,
      isRemote: true,
      urgency: "NORMAL",
      budgetType: "FIXED",
      payAmount: 400,
      payType: "FIXED",
      jobType: "GIG",
      workersRequired: 1,
      requiredSkills: JSON.stringify(["Data Entry & Excel", "Word Formatting", "Basic Computer"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1" }),
    },

    // 🛵 Delivery & Errands (Sirsa & Hisar)
    {
      title: "Urgent Evening Local Parcel & Document Delivery",
      description:
        "Deliver 8 retail packets and documents within Sirsa city radius (Sirsa town & court complex). Two-wheeler with valid driving license required. Fuel compensation included in escrow.",
      category: "Delivery & Errands",
      subcategory: "Local Delivery",
      employerId: employerProfiles["Sirsa"],
      location: "Sirsa",
      latitude: 29.5334,
      longitude: 75.0177,
      isRemote: false,
      urgency: "VERY_URGENT",
      budgetType: "FIXED",
      payAmount: 350,
      payType: "FIXED",
      jobType: "GIG",
      workersRequired: 1,
      requiredSkills: JSON.stringify(["Two-Wheeler Driving", "Route Navigation", "Parcel Delivery"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1" }),
    },
    {
      title: "Wholesale Goods Loading & Warehouse Dispatch Helper",
      description:
        "Assist warehouse supervisor with loading cartons into local delivery tempo and verifying dispatch counts. Industrial Area, Hisar. 4-hour morning shift.",
      category: "Delivery & Errands",
      subcategory: "Delivery",
      employerId: employerProfiles["Hisar"],
      location: "Hisar",
      latitude: 29.1492,
      longitude: 75.7217,
      isRemote: false,
      urgency: "NORMAL",
      budgetType: "DAILY",
      payAmount: 500,
      payType: "DAILY",
      jobType: "TEMPORARY",
      workersRequired: 2,
      requiredSkills: JSON.stringify(["Loading / Unloading", "Order Packing", "General Labour"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1" }),
    },

    // 🔧 Skilled Trades & Repair (Fatehabad & Sirsa)
    {
      title: "Retail Shop Electrical Wiring & LED Display Board Fixing",
      description:
        "Looking for an experienced electrician to install 4 LED track lights, check main circuit breaker, and connect external glow-sign board on DSP Road, Fatehabad. Tools required.",
      category: "Skilled Work",
      subcategory: "Electrician",
      employerId: employerProfiles["Fatehabad"],
      location: "Fatehabad",
      latitude: 29.5186,
      longitude: 75.4542,
      isRemote: false,
      urgency: "NORMAL",
      budgetType: "FIXED",
      payAmount: 600,
      payType: "FIXED",
      jobType: "GIG",
      workersRequired: 1,
      requiredSkills: JSON.stringify(["Residential Wiring", "Appliance Repair", "Electrician"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1" }),
    },
    {
      title: "Showroom Washroom Pipe Leakage & Valve Repair",
      description:
        "Plumber needed to replace 2 leaking angle valves and fix drainage trap in commercial property near Sirsa bus stand. Immediate assignment once accepted.",
      category: "Skilled Work",
      subcategory: "Plumber",
      employerId: employerProfiles["Sirsa"],
      location: "Sirsa",
      latitude: 29.5334,
      longitude: 75.0177,
      isRemote: false,
      urgency: "URGENT",
      budgetType: "FIXED",
      payAmount: 450,
      payType: "FIXED",
      jobType: "GIG",
      workersRequired: 1,
      requiredSkills: JSON.stringify(["Plumbing & Pipe Repair", "Pipe Fitting", "Repair & Maintenance"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1" }),
    },

    // 🏠 Household & Event Services (Fatehabad & Hisar)
    {
      title: "Commercial Space Pre-Opening Deep Cleaning Staff",
      description:
        "Need 2 helpers for floor mopping, window pane wiping, and dust removal before store inauguration on GT Road, Fatehabad. Cleaning liquids and mops will be provided.",
      category: "Household Services",
      subcategory: "Cleaning",
      employerId: employerProfiles["Fatehabad"],
      location: "Fatehabad",
      latitude: 29.5186,
      longitude: 75.4542,
      isRemote: false,
      urgency: "NORMAL",
      budgetType: "DAILY",
      payAmount: 500,
      payType: "DAILY",
      jobType: "GIG",
      workersRequired: 2,
      requiredSkills: JSON.stringify(["Deep Cleaning", "General Labour", "Housekeeping"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1" }),
    },
    {
      title: "Family Function Event Food Serving & Buffet Assistant",
      description:
        "Event helpers needed for welcoming guests, supervising buffet counters, and water serving during family gathering in Hisar. Respectable environment, uniform/smart attire requested.",
      category: "Household Services",
      subcategory: "Event Help",
      employerId: employerProfiles["Hisar"],
      location: "Hisar",
      latitude: 29.1492,
      longitude: 75.7217,
      isRemote: false,
      urgency: "NORMAL",
      budgetType: "FIXED",
      payAmount: 600,
      payType: "FIXED",
      jobType: "GIG",
      workersRequired: 3,
      requiredSkills: JSON.stringify(["Food Serving", "Event Setup", "Hospitality"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1" }),
    },

    // 🎓 Tutoring & Education (Hisar & Fatehabad)
    {
      title: "Home Tutor for Class 10th Mathematics & Science",
      description:
        "Require a passionate undergraduate student or tutor for Class 10th CBSE curriculum (Maths & Science). 1 hour daily, 5 days a week in Sector 14, Hisar.",
      category: "Tutoring & Education",
      subcategory: "School Tutor",
      employerId: employerProfiles["Hisar"],
      location: "Hisar",
      latitude: 29.1492,
      longitude: 75.7217,
      isRemote: false,
      urgency: "NORMAL",
      budgetType: "MONTHLY",
      payAmount: 3500,
      payType: "MONTHLY",
      jobType: "PART_TIME",
      workersRequired: 1,
      requiredSkills: JSON.stringify(["School Tutor", "Mathematics", "Science"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1" }),
    },
    {
      title: "Spoken English & Basic Computer Skills Mentor",
      description:
        "Tutor needed for college student preparing for job interviews. Focus on English conversation practice, resume writing, and email etiquette. 12 total sessions.",
      category: "Tutoring & Education",
      subcategory: "Language Tutor",
      employerId: employerProfiles["Fatehabad"],
      location: "Fatehabad",
      latitude: 29.5186,
      longitude: 75.4542,
      isRemote: true,
      urgency: "NORMAL",
      budgetType: "MONTHLY",
      payAmount: 3000,
      payType: "MONTHLY",
      jobType: "PART_TIME",
      workersRequired: 1,
      requiredSkills: JSON.stringify(["Language Tutor", "Resume Making", "Spoken English"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1" }),
    },
  ];

  // 3. Create or update the demo jobs in Prisma
  let seededCount = 0;
  for (const job of demoJobs) {
    const existing = await prisma.job.findFirst({
      where: {
        title: job.title,
        employerId: job.employerId,
      },
    });

    if (existing) {
      await prisma.job.update({
        where: { id: existing.id },
        data: {
          ...job,
          status: "OPEN",
        },
      });
    } else {
      await prisma.job.create({
        data: {
          ...job,
          status: "OPEN",
        },
      });
    }
    seededCount++;
  }

  console.log(`🎉 Successfully seeded ${seededCount} realistic demo jobs with status 'OPEN'!`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
