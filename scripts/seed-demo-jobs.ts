import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding realistic demo jobs across Fatehabad, Sirsa & Hisar...");

  // Find existing authentic employers
  const employers = await prisma.employerProfile.findMany({
    include: { user: true },
  });

  if (employers.length === 0) {
    console.error("❌ No employers found in database to associate jobs with.");
    process.exit(1);
  }

  const emp1 = employers[0];
  const emp2 = employers.length > 1 ? employers[1] : emp1;
  const emp3 = employers.length > 2 ? employers[2] : emp1;
  const emp4 = employers.length > 3 ? employers[3] : emp1;

  const demoJobs = [
    // 1. Academic & Assignment Work (2 jobs)
    {
      title: "Handwritten DBMS Practical File with ER Diagrams (35 Pages)",
      description: "Need neat and clean handwritten DBMS practical notebook containing 8 SQL experiments and 2 ER diagrams. Lab format must be followed. Notebook will be provided.",
      category: "Academic & Assignment Work",
      subcategory: "Assignment Writing",
      isRemote: true,
      urgency: "NORMAL",
      budgetType: "PER_PAGE",
      pricePerUnit: 15,
      unitType: "PAGE",
      quantity: 35,
      payAmount: 525,
      payType: "PER_PAGE",
      jobType: "GIG",
      deliveryMethod: "PHYSICAL_DELIVERY",
      location: "Near Guru Jambheshwar University (GJU), Hisar",
      requiredSkills: JSON.stringify(["Neat Handwriting", "DBMS", "Computer Science"]),
      categoryDetails: JSON.stringify({
        isDemo: true,
        seedBatch: "demo-v1",
        subject: "Database Management Systems (DBMS)",
        academicLevel: "Undergraduate (B.Tech / BCA)",
        workFormat: "Handwritten",
      }),
      employerId: emp1.id,
      status: "OPEN",
    },
    {
      title: "Class 12 Physics & Chemistry Investigatory Project",
      description: "Complete handwritten practical project on Electromagnetic Induction with circuit diagrams and graphs. Total 25 pages on one-side ruled sheets.",
      category: "Academic & Assignment Work",
      subcategory: "Lab Manual Preparation",
      isRemote: true,
      urgency: "URGENT",
      budgetType: "PER_PAGE",
      pricePerUnit: 18,
      unitType: "PAGE",
      quantity: 25,
      payAmount: 450,
      payType: "PER_PAGE",
      jobType: "GIG",
      deliveryMethod: "PHYSICAL_DELIVERY",
      location: "Barnala Road, Sirsa",
      requiredSkills: JSON.stringify(["Neat Handwriting", "Fast Writing", "Good English"]),
      categoryDetails: JSON.stringify({
        isDemo: true,
        seedBatch: "demo-v1",
        subject: "Physics",
        academicLevel: "Class 12 (CBSE / HBSE)",
        workFormat: "Handwritten",
      }),
      employerId: emp2.id,
      status: "OPEN",
    },

    // 2. Local Business Jobs (2 jobs)
    {
      title: "Festival Rush Counter Assistant & Billing Helper",
      description: "Looking for an energetic young person for 3 days to assist with customer packaging, cloth folding, and computer bill generation at our retail counter.",
      category: "Local Business Jobs",
      subcategory: "Retail & Counter Sales",
      isRemote: false,
      urgency: "NORMAL",
      budgetType: "DAILY",
      payAmount: 500,
      payType: "DAILY",
      jobType: "TEMPORARY",
      deliveryMethod: "ON_SITE",
      location: "DSP Road Market, Fatehabad",
      requiredSkills: JSON.stringify(["Counter Sales", "Customer Service", "Order Packing"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1", storeType: "Clothing & Apparel" }),
      employerId: emp3.id,
      status: "OPEN",
    },
    {
      title: "Inventory Stocking & Barcode Scanner Operator",
      description: "Assist grocery warehouse manager with unloading FMCG cartons, organizing racks, and scanning barcodes on incoming wholesale goods for 4 hours.",
      category: "Local Business Jobs",
      subcategory: "Warehouse & Stocking",
      isRemote: false,
      urgency: "NORMAL",
      budgetType: "HOURLY",
      payAmount: 400,
      payType: "FIXED",
      jobType: "PART_TIME",
      deliveryMethod: "ON_SITE",
      location: "Auto Market, Hisar",
      requiredSkills: JSON.stringify(["Inventory Stocking", "Order Packing", "General Physical Labour"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1", shiftDuration: "4 Hours" }),
      employerId: emp4.id,
      status: "OPEN",
    },

    // 3. Delivery & Errands (2 jobs)
    {
      title: "Local E-Commerce Small Parcel Deliveries (20 Drops)",
      description: "Distribute small pre-paid parcel packets to residential addresses across Sector 13 & Urban Estate. Must have your own bike/scooter and active smartphone.",
      category: "Delivery & Errands",
      subcategory: "Parcel Delivery",
      isRemote: false,
      urgency: "VERY_URGENT",
      budgetType: "FIXED",
      payAmount: 600,
      payType: "FIXED",
      jobType: "GIG",
      deliveryMethod: "LOCAL_DELIVERY",
      location: "Sector 13, Urban Estate, Hisar",
      requiredSkills: JSON.stringify(["Two-Wheeler Driving", "Route Navigation", "Customer Service"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1", fuelAllowance: "Included" }),
      employerId: emp1.id,
      status: "OPEN",
    },
    {
      title: "Emergency Pharmacy & Diagnostic Sample Runner",
      description: "Collect medicine packets from wholesale chemist near Civil Hospital and deliver to 4 local clinics. Requires two-wheeler.",
      category: "Delivery & Errands",
      subcategory: "Medicine & Urgent Delivery",
      isRemote: false,
      urgency: "URGENT",
      budgetType: "FIXED",
      payAmount: 350,
      payType: "FIXED",
      jobType: "GIG",
      deliveryMethod: "LOCAL_DELIVERY",
      location: "Near Civil Hospital, Fatehabad",
      requiredSkills: JSON.stringify(["Two-Wheeler Driving", "Route Navigation"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1", priority: "Urgent Medical" }),
      employerId: emp2.id,
      status: "OPEN",
    },

    // 4. Digital Work (2 jobs)
    {
      title: "GST Invoice Data Entry into Tally / Excel (120 Bills)",
      description: "Enter purchase and sale invoices for the month into Microsoft Excel format. Clear scanned bill copies will be sent over WhatsApp/drive.",
      category: "Digital Work",
      subcategory: "Data Entry & Office",
      isRemote: true,
      urgency: "NORMAL",
      budgetType: "FIXED",
      payAmount: 700,
      payType: "FIXED",
      jobType: "GIG",
      deliveryMethod: "DIGITAL_UPLOAD",
      location: "Bhattu Road, Fatehabad",
      requiredSkills: JSON.stringify(["Data Entry & Excel", "Good English"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1", tool: "Excel / Google Sheets" }),
      employerId: emp3.id,
      status: "OPEN",
    },
    {
      title: "Diwali Sale Promotional Posters & WhatsApp Banners (5 Creatives)",
      description: "Design 5 vibrant festival discount posters for sweet shop social media and WhatsApp broadcast using Canva or Photoshop.",
      category: "Digital Work",
      subcategory: "Graphic Design",
      isRemote: true,
      urgency: "NORMAL",
      budgetType: "FIXED",
      payAmount: 500,
      payType: "FIXED",
      jobType: "GIG",
      deliveryMethod: "DIGITAL_UPLOAD",
      location: "Railway Road, Sirsa",
      requiredSkills: JSON.stringify(["Graphic Design", "Social Media Graphics"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1", tool: "Canva / Photoshop" }),
      employerId: emp4.id,
      status: "OPEN",
    },

    // 5. Skilled Work (2 jobs)
    {
      title: "Showroom LED False Ceiling Wiring & Track Lights Setup",
      description: "Experienced electrician needed to install 12 LED cob spotlights and connection strip in renovated garments outlet. Ladder and tools provided.",
      category: "Skilled Work",
      subcategory: "Electrical & Lighting",
      isRemote: false,
      urgency: "URGENT",
      budgetType: "FIXED",
      payAmount: 850,
      payType: "FIXED",
      jobType: "GIG",
      deliveryMethod: "ON_SITE",
      location: "Bhadra Bazar, Sirsa",
      requiredSkills: JSON.stringify(["Electrical Wiring", "Appliance Repair"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1", trade: "Electrical" }),
      employerId: emp1.id,
      status: "OPEN",
    },
    {
      title: "Commercial RO Water Purifier Membrane & Filter Replacement",
      description: "Service RO plant at coaching center, replace sediment & carbon filters, and check TDS levels. Filters provided by center.",
      category: "Skilled Work",
      subcategory: "Plumbing & Appliance Repair",
      isRemote: false,
      urgency: "NORMAL",
      budgetType: "FIXED",
      payAmount: 450,
      payType: "FIXED",
      jobType: "GIG",
      deliveryMethod: "ON_SITE",
      location: "Bus Stand Road, Fatehabad",
      requiredSkills: JSON.stringify(["Appliance Repair", "Plumbing"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1", trade: "RO Technician" }),
      employerId: emp2.id,
      status: "OPEN",
    },

    // 6. Household Services (2 jobs)
    {
      title: "3BHK Kothi Post-Painting Deep Cleaning & Floor Scrubbing",
      description: "Need 2 helpers for floor machine scrubbing, paint spot removal, and glass window cleaning before housewarming ceremony.",
      category: "Household Services",
      subcategory: "Deep Cleaning",
      isRemote: false,
      urgency: "NORMAL",
      budgetType: "DAILY",
      payAmount: 1100,
      payType: "DAILY",
      jobType: "GIG",
      deliveryMethod: "ON_SITE",
      location: "Sector 14, Hisar",
      requiredSkills: JSON.stringify(["General Physical Labour", "Cleaning"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1", duration: "Full Day" }),
      employerId: emp3.id,
      status: "OPEN",
    },
    {
      title: "7-Seater Fabric Sofa & Carpet Foam Shampoo Cleaning",
      description: "Shampoo cleaning of living room sofa set and two wool carpets. Vacuum and foam extraction required.",
      category: "Household Services",
      subcategory: "Upholstery & Carpet Care",
      isRemote: false,
      urgency: "NORMAL",
      budgetType: "FIXED",
      payAmount: 650,
      payType: "FIXED",
      jobType: "GIG",
      deliveryMethod: "ON_SITE",
      location: "Model Town, Fatehabad",
      requiredSkills: JSON.stringify(["Cleaning"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1", service: "Sofa Spa" }),
      employerId: emp4.id,
      status: "OPEN",
    },

    // 7. Tutoring & Education (2 jobs)
    {
      title: "Class 10 CBSE Mathematics Crash Course & Doubt Clearing",
      description: "Home tutor needed for Class 10 student for 1.5 hours daily (Trigonometry and Circles chapters). College students with strong math welcome.",
      category: "Tutoring & Education",
      subcategory: "Home Tuition",
      isRemote: false,
      urgency: "NORMAL",
      budgetType: "HOURLY",
      payAmount: 400,
      payType: "HOURLY",
      jobType: "PART_TIME",
      deliveryMethod: "ON_SITE",
      location: "C-Block, Sirsa",
      requiredSkills: JSON.stringify(["Mathematics", "Teaching"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1", grade: "10th CBSE" }),
      employerId: emp1.id,
      status: "OPEN",
    },
    {
      title: "Spoken English & Interview Practice Tutor for College Fresher",
      description: "Online / Evening 1-on-1 spoken English sessions for resume preparation and interview communication fluency. 10 sessions total.",
      category: "Tutoring & Education",
      subcategory: "Language & Soft Skills",
      isRemote: true,
      urgency: "NORMAL",
      budgetType: "FIXED",
      payAmount: 1200,
      payType: "FIXED",
      jobType: "PART_TIME",
      deliveryMethod: "DIGITAL_UPLOAD",
      location: "Hisar Cantt / Online",
      requiredSkills: JSON.stringify(["Good English", "Communication"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1", mode: "Online / Evening" }),
      employerId: emp2.id,
      status: "OPEN",
    },

    // 8. Creative & Media Work (2 jobs)
    {
      title: "YouTube Video Editor for Local Agri & Dairy Channel",
      description: "Edit 3 weekly vlogs (8–12 mins) showcasing modern dairy farming and cattle care in Haryana. Add subtitles, sound effects, and clean thumbnail in Canva.",
      category: "Creative Work",
      subcategory: "Video Editing & Content",
      isRemote: true,
      urgency: "NORMAL",
      budgetType: "FIXED",
      payAmount: 900,
      payType: "FIXED",
      jobType: "GIG",
      deliveryMethod: "DIGITAL_UPLOAD",
      location: "Sirsa / Remote",
      requiredSkills: JSON.stringify(["Video Editing", "Canva", "Social Media Graphics"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1", software: "Premiere / CapCut" }),
      employerId: emp3.id,
      status: "OPEN",
    },
    {
      title: "Pre-Wedding Photography Lighting Assistant & Gear Handler",
      description: "Support photographer with LED softbox reflector stands, camera battery swaps, and outdoor props for full evening photo shoot.",
      category: "Creative Work",
      subcategory: "Photography & Videography",
      isRemote: false,
      urgency: "NORMAL",
      budgetType: "DAILY",
      payAmount: 750,
      payType: "DAILY",
      jobType: "TEMPORARY",
      deliveryMethod: "ON_SITE",
      location: "Town Park Road, Fatehabad",
      requiredSkills: JSON.stringify(["Photography Assistant", "Lighting Setup"]),
      categoryDetails: JSON.stringify({ isDemo: true, seedBatch: "demo-v1", shootType: "Outdoor Pre-Wedding" }),
      employerId: emp4.id,
      status: "OPEN",
    },
  ];

  let count = 0;
  for (const job of demoJobs) {
    await prisma.job.create({
      data: job,
    });
    count++;
  }

  console.log(`✅ Successfully seeded ${count} realistic demo jobs across Fatehabad, Sirsa & Hisar!`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
