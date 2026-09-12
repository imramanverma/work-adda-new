import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Work Adda database seeding...");

  // Clean existing data in dependency order
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.workAssignment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  // 1. Seed Skills across diverse categories
  const skillsData = [
    // Delivery & Logistics
    { name: "Two-Wheeler Driving", category: "Delivery" },
    { name: "Order Packing", category: "Logistics" },
    { name: "Inventory Stocking", category: "Logistics" },
    { name: "Forklift Handling", category: "Logistics" },
    { name: "Route Navigation", category: "Delivery" },

    // Retail & Sales
    { name: "Counter Sales", category: "Retail" },
    { name: "Billing & Cashiering", category: "Retail" },
    { name: "Customer Service", category: "Retail" },
    { name: "Store Display Setup", category: "Retail" },
    { name: "Telecalling & Leads", category: "Sales" },

    // Hospitality & Events
    { name: "Event Setup & Ushering", category: "Events" },
    { name: "Food Serving", category: "Hospitality" },
    { name: "Kitchen Assistance", category: "Hospitality" },
    { name: "Barista Skills", category: "Hospitality" },
    { name: "Catering Support", category: "Events" },

    // Office & Tech
    { name: "Data Entry & Excel", category: "Data Entry" },
    { name: "Basic Receptionist", category: "Office Assistance" },
    { name: "Social Media Posting", category: "Marketing" },
    { name: "Graphic Design (Canva)", category: "Marketing" },
    { name: "Computer Troubleshooting", category: "IT & Technology" },

    // Skilled Trades & Repairs
    { name: "Residential Wiring", category: "Repair & Maintenance" },
    { name: "Plumbing & Pipe Repair", category: "Repair & Maintenance" },
    { name: "Appliance Repair", category: "Repair & Maintenance" },
    { name: "Carpentry & Furniture Assembly", category: "Construction" },
    { name: "Painting & Wall Finish", category: "Construction" },
    { name: "General Physical Labour", category: "General Labour" },
  ];

  for (const s of skillsData) {
    await prisma.skill.create({ data: s });
  }
  console.log(`✅ Seeded ${skillsData.length} skills`);

  // 2. Seed Admin
  const admin = await prisma.user.create({
    data: {
      name: "Work Adda Admin",
      email: "admin@workadda.com",
      phone: "+919876500000",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
      isVerified: true,
      location: "Model Town, Fatehabad",
      latitude: 29.5349,
      longitude: 75.4542,
    },
  });
  console.log(`✅ Seeded Admin: ${admin.email}`);

  // 3. Seed Employers (12 realistic local businesses)
  const employersData = [
    {
      name: "Gurpreet Singh",
      email: "employer@workadda.com", // Primary demo employer
      phone: "+919811100001",
      businessName: "Haryana Logistics & Quick配送",
      businessType: "Logistics & Delivery",
      description: "Fast-growing hyperlocal parcel and e-commerce distribution hub serving Fatehabad & Sirsa.",
      address: "Plot 12, GT Road, Near Bus Stand",
      location: "Fatehabad",
      latitude: 29.5186,
      longitude: 75.0289,
      website: "https://haryanalogistics.example.com",
      rating: 4.8,
    },
    {
      name: "Rohan Verma",
      email: "rohan.verma@example.com",
      phone: "+919811100002",
      businessName: "Verma Departmental & General Store",
      businessType: "Retail Shop",
      description: "Premium neighborhood grocery & daily essentials superstore in Model Town.",
      address: "SCO 14-15, Model Town Market, Fatehabad",
      location: "Fatehabad",
      latitude: 29.5186,
      longitude: 75.8273,
      rating: 4.6,
    },
    {
      name: "Simran Kaur",
      email: "simran.events@example.com",
      phone: "+919811100003",
      businessName: "Virasat Event Management",
      businessType: "Events & Wedding Planners",
      description: "Specializing in royal weddings, corporate conferences, and cultural festivals.",
      address: "DSP Road, Near Rotary Chowk, Fatehabad",
      location: "Sirsa",
      latitude: 29.5210,
      longitude: 75.0350,
      rating: 4.9,
    },
    {
      name: "Harjeet Sandhu",
      email: "harjeet@greencitycafe.com",
      phone: "+919811100004",
      businessName: "GreenCity Artisan Bakery & Cafe",
      businessType: "Hospitality & Restaurant",
      description: "Cozy European-style cafe and live sourdough bakery in Begu Road, Sirsa.",
      address: "Barnala Road, Sirsa",
      location: "Sirsa",
      latitude: 29.5186,
      longitude: 75.4542,
      rating: 4.7,
    },
    {
      name: "Vikram Malhotra",
      email: "vikram@malhotratech.com",
      phone: "+919811100005",
      businessName: "Malhotra Electronics & Appliance Hub",
      businessType: "Wholesale & Electronics",
      description: "Authorized multi-brand distribution center for home appliances and commercial electronics.",
      address: "Main Bazaar, Fatehabad",
      location: "Fatehabad",
      latitude: 29.5349,
      longitude: 75.8541,
      rating: 4.4,
    },
    {
      name: "Pooja Sharma",
      email: "pooja@zenithdigital.com",
      phone: "+919811100006",
      businessName: "Zenith Digital & Business Services",
      businessType: "IT & Services",
      description: "Backoffice processing, digitization, and catalog management for MSMEs.",
      address: "Subhash Chowk Commercial Complex, Sirsa",
      location: "Sirsa",
      latitude: 29.5186,
      longitude: 75.0289,
      rating: 4.8,
    },
    {
      name: "Amitabh Mehra",
      email: "amitabh@Sirsacloth.com",
      phone: "+919811100007",
      businessName: "Mehra Textiles & Garment Emporium",
      businessType: "Retail & Wholesale",
      description: "Traditional Phulkari and modern ethnic garment manufacturer and retail showroom.",
      address: "Budhlada Road, Ratia, Fatehabad",
      location: "Sirsa",
      latitude: 29.5400,
      longitude: 74.7214,
      rating: 4.5,
    },
    {
      name: "Dr. Navneet Chawla",
      email: "navneet@careplusclinic.com",
      phone: "+919811100008",
      businessName: "CarePlus Diagnostic & Wellness Center",
      businessType: "Healthcare / Clinic",
      description: "Modern outpatient clinic and diagnostic laboratory offering pathology and ECG services.",
      address: "Civil Hospital Road, Sirsa",
      location: "Fatehabad",
      latitude: 29.5210,
      longitude: 75.5786,
      rating: 4.9,
    },
    {
      name: "Kuldeep Dhillon",
      email: "kuldeep@dhillonfarms.com",
      phone: "+919811100009",
      businessName: "Dhillon Agri Organics & Cold Store",
      businessType: "Agriculture & Cold Storage",
      description: "Wholesale supply of fresh farm produce, dairy, and cold storage logistics.",
      address: "Chandigarh Road, Tohana, Fatehabad",
      location: "Fatehabad",
      latitude: 29.5210,
      longitude: 75.6174,
      rating: 4.3,
    },
    {
      name: "Ananya Gupta",
      email: "ananya@printcraftstudio.com",
      phone: "+919811100010",
      businessName: "PrintCraft Signage & Advertising",
      businessType: "Advertising & Printing",
      description: "Commercial digital printing, CNC cutting, and outdoor banner fabrication studio.",
      address: "Mandi Dabwali, Sirsa",
      location: "Fatehabad",
      latitude: 29.5186,
      longitude: 75.0289,
      rating: 4.6,
    },
    {
      name: "Rajesh Mittal",
      email: "rajesh@mittalsons.com",
      phone: "+919811100011",
      businessName: "Mittal Hardware & Sanitary Store",
      businessType: "Building Materials",
      description: "Large distributor of plumbing pipes, tiles, and bathroom fixtures.",
      address: "New Anaj Mandi, Fatehabad",
      location: "Sirsa",
      latitude: 29.5186,
      longitude: 75.4542,
      rating: 4.5,
    },
    {
      name: "Sandeep Sood",
      email: "sandeep@soodcaterers.com",
      phone: "+919811100012",
      businessName: "Royal Sood Caterers & Kitchen",
      businessType: "Catering & Banquets",
      description: "Full service catering for grand banquets, private dinners, and festivals.",
      address: "Hanumangarh Road, Ellenabad, Sirsa",
      location: "Fatehabad",
      latitude: 29.5186,
      longitude: 75.0289,
      rating: 4.8,
    },
  ];

  const createdEmployers = [];
  for (const emp of employersData) {
    const user = await prisma.user.create({
      data: {
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        passwordHash: defaultPasswordHash,
        role: "EMPLOYER",
        isVerified: true,
        location: emp.location,
        latitude: emp.latitude,
        longitude: emp.longitude,
        employerProfile: {
          create: {
            businessName: emp.businessName,
            businessType: emp.businessType,
            description: emp.description,
            address: emp.address,
            location: emp.location,
            latitude: emp.latitude,
            longitude: emp.longitude,
            website: emp.website,
            verificationStatus: "VERIFIED",
            rating: emp.rating,
          },
        },
      },
      include: { employerProfile: true },
    });
    createdEmployers.push(user);
  }
  console.log(`✅ Seeded ${createdEmployers.length} employers`);

  // 4. Seed Workers (22 realistic local workers)
  const workersData = [
    {
      name: "Amanpreet Singh",
      email: "worker@workadda.com", // Primary demo worker
      phone: "+919822200001",
      bio: "Energetic student at Panjab University looking for part-time delivery and event assistant gigs. Punctual and reliable.",
      skills: ["Two-Wheeler Driving", "Order Packing", "Customer Service", "Route Navigation"],
      experience: "2 years part-time delivery with local stores; 100+ deliveries completed without delay.",
      education: "Pursuing B.Com (Final Year)",
      availability: "Flexible / Afternoons & Weekends",
      preferredJobType: "PART_TIME",
      preferredDistance: 12,
      expectedPay: 600,
      rating: 4.9,
      completedJobs: 18,
      location: "DSP Road, Fatehabad",
      latitude: 29.5186,
      longitude: 75.4542,
    },
    {
      name: "Karan Johal",
      email: "karan.johal@example.com",
      phone: "+919822200002",
      bio: "Experienced warehouse and inventory helper. Expert in heavy carton handling and barcode scanning.",
      skills: ["Inventory Stocking", "Order Packing", "General Physical Labour"],
      experience: "3 years in Fatehabad garment wholesale depot.",
      education: "Higher Secondary (12th Passed)",
      availability: "Full-time",
      preferredJobType: "FULL_TIME",
      preferredDistance: 15,
      expectedPay: 800,
      rating: 4.8,
      completedJobs: 24,
      location: "Model Town, Fatehabad",
      latitude: 29.5349,
      longitude: 75.823,
    },
    {
      name: "Neha Rajput",
      email: "neha.rajput@example.com",
      phone: "+919822200003",
      bio: "College student with fast typing speed (60 wpm) and advanced Excel proficiency. Looking for part-time office/data tasks.",
      skills: ["Data Entry & Excel", "Basic Receptionist", "Customer Service"],
      experience: "Completed summer intern role handling invoice entries and billing spreadsheets.",
      education: "BCA 2nd Year, GNDU",
      availability: "Evenings & Weekends",
      preferredJobType: "FLEXIBLE",
      preferredDistance: 10,
      expectedPay: 500,
      rating: 4.9,
      completedJobs: 12,
      location: "Begu Road, Sirsa",
      latitude: 29.5210,
      longitude: 74.7214,
    },
    {
      name: "Jaspal Bains",
      email: "jaspal.bains@example.com",
      phone: "+919822200004",
      bio: "Certified residential electrician with own toolkit. Fast response for wiring, MCB tripping, fan, and light installations.",
      skills: ["Residential Wiring", "Appliance Repair", "Computer Troubleshooting"],
      experience: "5 years certified industrial & residential technician with ITI diploma.",
      education: "ITI Electrical Diploma",
      availability: "Immediate / On-call",
      preferredJobType: "GIG",
      preferredDistance: 20,
      expectedPay: 900,
      rating: 5.0,
      completedJobs: 35,
      location: "Begu Road, Sirsa",
      latitude: 29.5349,
      longitude: 75.0289,
    },
    {
      name: "Tanya Kapoor",
      email: "tanya.kapoor@example.com",
      phone: "+919822200005",
      bio: "Creative social media enthusiast and Canva graphic designer. Helping retail stores launch Instagram offers.",
      skills: ["Social Media Posting", "Graphic Design (Canva)", "Telecalling & Leads"],
      experience: "Managed social handles for 4 local clothing boutiques and cafes in Tricity.",
      education: "BA Journalism & Mass Comm",
      availability: "Flexible / Remote & On-site",
      preferredJobType: "PART_TIME",
      preferredDistance: 25,
      expectedPay: 700,
      rating: 4.7,
      completedJobs: 9,
      location: "Begu Road, Sirsa",
      latitude: 29.5186,
      longitude: 75.0289,
    },
    {
      name: "Manpreet Mann",
      email: "manpreet.mann@example.com",
      phone: "+919822200006",
      bio: "Friendly sales assistant with retail showroom experience in textiles and mobile electronics.",
      skills: ["Counter Sales", "Billing & Cashiering", "Customer Service"],
      experience: "2 years at flagship electronics showroom.",
      education: "Graduation (B.A)",
      availability: "Full-time / Day shifts",
      preferredJobType: "FULL_TIME",
      preferredDistance: 8,
      expectedPay: 16000,
      rating: 4.6,
      completedJobs: 15,
      location: "DSP Road, Fatehabad",
      latitude: 29.5210,
      longitude: 75.581,
    },
    {
      name: "Bikramjit Sidhu",
      email: "bikramjit.sidhu@example.com",
      phone: "+919822200007",
      bio: "Trained hospitality steward and barista with passion for customer hospitality at events and cafes.",
      skills: ["Food Serving", "Barista Skills", "Kitchen Assistance", "Event Setup & Ushering"],
      experience: "Worked at heritage cafe & handled 15+ high profile wedding banquets.",
      education: "Diploma in Hotel Operations",
      availability: "Weekends & Evenings",
      preferredJobType: "GIG",
      preferredDistance: 15,
      expectedPay: 750,
      rating: 4.8,
      completedJobs: 21,
      location: "Mall Road, Sirsa",
      latitude: 29.5400,
      longitude: 75.0350,
    },
    {
      name: "Ravi Kumar",
      email: "ravi.kumar@example.com",
      phone: "+919822200008",
      bio: "Skilled plumber with expertise in sanitary fittings, water pump repair, and leak detection.",
      skills: ["Plumbing & Pipe Repair", "Carpentry & Furniture Assembly"],
      experience: "7 years plumbing across residential societies and commercial offices.",
      education: "High School",
      availability: "Flexible",
      preferredJobType: "GIG",
      preferredDistance: 12,
      expectedPay: 850,
      rating: 4.9,
      completedJobs: 42,
      location: "New Anaj Mandi, Fatehabad",
      latitude: 29.5349,
      longitude: 75.4542,
    },
    {
      name: "Simranjit Dhillon",
      email: "simranjit.d@example.com",
      phone: "+919822200009",
      bio: "Polite front-desk coordinator and billing operator with strong phone etiquette.",
      skills: ["Basic Receptionist", "Billing & Cashiering", "Data Entry & Excel"],
      experience: "1 year receptionist at dental clinic.",
      education: "B.Com Graduate",
      availability: "Full-time",
      preferredJobType: "FULL_TIME",
      preferredDistance: 6,
      expectedPay: 15000,
      rating: 4.7,
      completedJobs: 8,
      location: "Phase 3B2, Fatehabad",
      latitude: 29.5349,
      longitude: 75.4542,
    },
    {
      name: "Sunil Sharma",
      email: "sunil.sharma@example.com",
      phone: "+919822200010",
      bio: "Experienced event setup crew lead, sound/lighting cable assistant, and crowd usher.",
      skills: ["Event Setup & Ushering", "General Physical Labour", "Catering Support"],
      experience: "Handled 30+ wedding and concert stages in North India.",
      education: "10th Standard",
      availability: "Weekends & Late evenings",
      preferredJobType: "TEMPORARY",
      preferredDistance: 25,
      expectedPay: 900,
      rating: 4.9,
      completedJobs: 29,
      location: "Chaura Bazar, Sirsa",
      latitude: 29.5186,
      longitude: 75.856,
    },
    {
      name: "Deepak Rawat",
      email: "deepak.rawat@example.com",
      phone: "+919822200011",
      bio: "Express grocery delivery rider with valid two-wheeler license, helmet, and smartphone.",
      skills: ["Two-Wheeler Driving", "Route Navigation", "Customer Service"],
      experience: "Delivered for top hyperlocal apps; 99% on-time delivery rate.",
      education: "12th Standard",
      availability: "Immediate / Shift based",
      preferredJobType: "GIG",
      preferredDistance: 10,
      expectedPay: 650,
      rating: 4.8,
      completedJobs: 50,
      location: "Subhash Chowk, Sirsa",
      latitude: 29.5186,
      longitude: 75.4542,
    },
    {
      name: "Pooja Rani",
      email: "pooja.rani@example.com",
      phone: "+919822200012",
      bio: "Dedicated store assistant with expertise in billing systems and merchandise arrangement.",
      skills: ["Store Display Setup", "Billing & Cashiering", "Counter Sales"],
      experience: "2 years retail associate at lifestyle department store.",
      education: "Graduate in Commerce",
      availability: "Full-time",
      preferredJobType: "FULL_TIME",
      preferredDistance: 8,
      expectedPay: 14000,
      rating: 4.7,
      completedJobs: 11,
      location: "Model Town, Patiala",
      latitude: 29.5186,
      longitude: 75.0289,
    },
    {
      name: "Gagandeep Singh",
      email: "gagandeep.s@example.com",
      phone: "+919822200013",
      bio: "Physical labour helper for construction loading, building debris clearance, and painting support.",
      skills: ["General Physical Labour", "Painting & Wall Finish", "Carpentry & Furniture Assembly"],
      experience: "4 years in renovation and flat turnover projects.",
      education: "Primary Education",
      availability: "Full-time / Flexible",
      preferredJobType: "TEMPORARY",
      preferredDistance: 20,
      expectedPay: 700,
      rating: 4.6,
      completedJobs: 33,
      location: "Industrial Area, Jalandhar",
      latitude: 29.5210,
      longitude: 75.62,
    },
    {
      name: "Ankit Goyal",
      email: "ankit.goyal@example.com",
      phone: "+919822200014",
      bio: "B.Tech Computer Science student available for IT support, printer setup, PC formatting, and networking.",
      skills: ["Computer Troubleshooting", "Data Entry & Excel", "Social Media Posting"],
      experience: "Freelance PC technician and campus tech coordinator.",
      education: "B.Tech CSE 3rd Year",
      availability: "Flexible / Weekends",
      preferredJobType: "PART_TIME",
      preferredDistance: 15,
      expectedPay: 750,
      rating: 4.9,
      completedJobs: 14,
      location: "Hisar Road, Fatehabad",
      latitude: 29.5349,
      longitude: 75.4542,
    },
    {
      name: "Preeti Verma",
      email: "preeti.verma@example.com",
      phone: "+919822200015",
      bio: "Customer success and telecalling executive. Fluent in Hindi, Haryanvi, and English.",
      skills: ["Telecalling & Leads", "Customer Service", "Basic Receptionist"],
      experience: "Handled outbound lead generation for local educational academy.",
      education: "Bachelor of Arts",
      availability: "Part-time mornings",
      preferredJobType: "PART_TIME",
      preferredDistance: 10,
      expectedPay: 550,
      rating: 4.8,
      completedJobs: 16,
      location: "Civil Hospital Road, Fatehabad",
      latitude: 29.5349,
      longitude: 75.835,
    },
    {
      name: "Sukhwinder Sandhu",
      email: "sukhwinder.s@example.com",
      phone: "+919822200016",
      bio: "Professional furniture assembler and cabinet carpenter. Fast flat-pack assembly for IKEA and urban ladder furniture.",
      skills: ["Carpentry & Furniture Assembly", "Painting & Wall Finish"],
      experience: "6 years master carpenter assistant in Fatehabad & Sirsa.",
      education: "High School",
      availability: "Full-time / On-call",
      preferredJobType: "GIG",
      preferredDistance: 18,
      expectedPay: 950,
      rating: 5.0,
      completedJobs: 28,
      location: "Ellenabad, Sirsa",
      latitude: 29.5349,
      longitude: 75.4542,
    },
    {
      name: "Rajwant Kaur",
      email: "rajwant.k@example.com",
      phone: "+919822200017",
      bio: "Catering food helper and kitchen prep assistant with high hygiene standards.",
      skills: ["Kitchen Assistance", "Food Serving", "Catering Support"],
      experience: "3 years in banquet kitchens and community dining.",
      education: "10th Standard",
      availability: "Weekends / Festive days",
      preferredJobType: "TEMPORARY",
      preferredDistance: 10,
      expectedPay: 600,
      rating: 4.7,
      completedJobs: 20,
      location: "Circular Road, Sirsa",
      latitude: 29.5210,
      longitude: 75.0350,
    },
    {
      name: "Harish Chander",
      email: "harish.chander@example.com",
      phone: "+919822200018",
      bio: "Wholesale loading and truck dispatch assistant. Punctual, strong, and dependable.",
      skills: ["Order Packing", "Inventory Stocking", "General Physical Labour"],
      experience: "3 years in grain market and FMCG depots.",
      education: "Middle School",
      availability: "Early mornings & Day shifts",
      preferredJobType: "FULL_TIME",
      preferredDistance: 12,
      expectedPay: 700,
      rating: 4.5,
      completedJobs: 19,
      location: "Grain Market, Jalandhar",
      latitude: 29.5400,
      longitude: 75.59,
    },
    {
      name: "Muskaan Batra",
      email: "muskaan.batra@example.com",
      phone: "+919822200019",
      bio: "Product display stylist and visual merchandising helper for retail popups and festivals.",
      skills: ["Store Display Setup", "Customer Service", "Graphic Design (Canva)"],
      experience: "Styled stalls at Sirsa Club and Sector 17 trade fairs.",
      education: "Fashion Design Diploma",
      availability: "Weekends & Short stints",
      preferredJobType: "GIG",
      preferredDistance: 15,
      expectedPay: 800,
      rating: 4.9,
      completedJobs: 13,
      location: "Barnala Road, Sirsa",
      latitude: 29.5349,
      longitude: 75.4542,
    },
    {
      name: "Jasleen Sahni",
      email: "jasleen.sahni@example.com",
      phone: "+919822200020",
      bio: "Energetic university student seeking weekend ushering and event coordination work.",
      skills: ["Event Setup & Ushering", "Customer Service", "Basic Receptionist"],
      experience: "Usher at TEDx events and college convocation festivals.",
      education: "B.Sc Psychology, PU",
      availability: "Weekends only",
      preferredJobType: "PART_TIME",
      preferredDistance: 12,
      expectedPay: 650,
      rating: 4.9,
      completedJobs: 15,
      location: "Tohana Road, Fatehabad",
      latitude: 29.5349,
      longitude: 75.4542,
    },
    {
      name: "Gursharan Bhatti",
      email: "gursharan.b@example.com",
      phone: "+919822200021",
      bio: "Wall painter and surface polish worker with experience in both residential emulsion and whitewash.",
      skills: ["Painting & Wall Finish", "General Physical Labour"],
      experience: "5 years painting private houses and shops.",
      education: "Primary Education",
      availability: "Full-time",
      preferredJobType: "TEMPORARY",
      preferredDistance: 15,
      expectedPay: 750,
      rating: 4.6,
      completedJobs: 22,
      location: "GT Road, Phagwara near Jalandhar",
      latitude: 29.5400,
      longitude: 75.77,
    },
    {
      name: "Vivek Tiwari",
      email: "vivek.tiwari@example.com",
      phone: "+919822200022",
      bio: "Dependable multi-tasker for store stock counting, barcode label tagging, and parcel loading.",
      skills: ["Order Packing", "Inventory Stocking", "Billing & Cashiering"],
      experience: "2 years in multi-brand footwear store warehouse.",
      education: "12th Standard",
      availability: "Full-time",
      preferredJobType: "FULL_TIME",
      preferredDistance: 10,
      expectedPay: 14500,
      rating: 4.7,
      completedJobs: 17,
      location: "New Anaj Mandi, Fatehabad",
      latitude: 29.5186,
      longitude: 75.91,
    },
  ];

  const createdWorkers = [];
  for (const w of workersData) {
    const user = await prisma.user.create({
      data: {
        name: w.name,
        email: w.email,
        phone: w.phone,
        passwordHash: defaultPasswordHash,
        role: "WORKER",
        isVerified: true,
        location: w.location,
        latitude: w.latitude,
        longitude: w.longitude,
        workerProfile: {
          create: {
            bio: w.bio,
            skills: JSON.stringify(w.skills),
            experience: w.experience,
            education: w.education,
            availability: w.availability,
            preferredJobType: w.preferredJobType,
            preferredDistance: w.preferredDistance,
            expectedPay: w.expectedPay,
            rating: w.rating,
            completedJobs: w.completedJobs,
          },
        },
      },
      include: { workerProfile: true },
    });
    createdWorkers.push(user);
  }
  console.log(`✅ Seeded ${createdWorkers.length} workers`);

  // 5. Seed 32 Jobs across diverse categories and locations
  const jobsData = [
    {
      employerIndex: 0, // Haryana Logistics (Chandigarh)
      title: "Hyperlocal Delivery Assistant (Fatehabad Hub)",
      description: "Looking for punctual two-wheeler riders to deliver local e-commerce packages across Chandigarh Sector 17, 22, and Fatehabad. Fuel allowance and performance incentives provided daily.",
      category: "Delivery",
      requiredSkills: ["Two-Wheeler Driving", "Order Packing", "Route Navigation"],
      jobType: "PART_TIME",
      location: "GT Road, Fatehabad",
      latitude: 29.5186,
      longitude: 75.4542,
      payAmount: 700,
      payType: "DAILY",
      workersRequired: 4,
      status: "OPEN",
    },
    {
      employerIndex: 0, // Haryana Logistics
      title: "Warehouse Inventory & Dispatch Helper",
      description: "Assist with unloading shipment trucks, scanning barcodes, sorting parcels by PIN code, and preparing delivery crates for riders.",
      category: "Logistics",
      requiredSkills: ["Order Packing", "Inventory Stocking", "General Physical Labour"],
      jobType: "FULL_TIME",
      location: "GT Road, Fatehabad",
      latitude: 29.5186,
      longitude: 75.4542,
      payAmount: 16500,
      payType: "MONTHLY",
      workersRequired: 2,
      status: "OPEN",
    },
    {
      employerIndex: 1, // Verma Departmental (Sirsa)
      title: "Store Helper & Grocery Shelf Stocker",
      description: "Stock fresh groceries and packaged goods on supermarket shelves, assist customers in locating items, and maintain clean display aisles.",
      category: "Retail",
      requiredSkills: ["Inventory Stocking", "Customer Service", "Store Display Setup"],
      jobType: "FULL_TIME",
      location: "Model Town Market, Sirsa",
      latitude: 29.5349,
      longitude: 75.8273,
      payAmount: 14000,
      payType: "MONTHLY",
      workersRequired: 3,
      status: "OPEN",
    },
    {
      employerIndex: 1, // Verma Departmental
      title: "Weekend Cashier & POS Operator",
      description: "Manage checkout counter during busy weekend rush, scan items with barcode gun, handle UPI and cash payments accurately.",
      category: "Retail",
      requiredSkills: ["Billing & Cashiering", "Customer Service", "Data Entry & Excel"],
      jobType: "PART_TIME",
      location: "Model Town Market, Sirsa",
      latitude: 29.5349,
      longitude: 75.8273,
      payAmount: 600,
      payType: "DAILY",
      workersRequired: 2,
      status: "OPEN",
    },
    {
      employerIndex: 2, // Virasat Events (Sirsa)
      title: "Royal Wedding Event Setup Crew & Ushers",
      description: "Support upcoming 3-day grand wedding at heritage resort. Coordinate guest welcome ushering, flower petal setup, and buffet floor assistance.",
      category: "Events",
      requiredSkills: ["Event Setup & Ushering", "Customer Service", "Catering Support"],
      jobType: "GIG",
      location: "Mall Road, Sirsa",
      latitude: 29.5210,
      longitude: 75.0350,
      payAmount: 1000,
      payType: "DAILY",
      workersRequired: 8,
      status: "OPEN",
    },
    {
      employerIndex: 2, // Virasat Events
      title: "Audio/Stage Lighting Assistant",
      description: "Assist master sound engineer with microphone checks, running cables, and positioning stage spotlights for cultural musical night.",
      category: "Events",
      requiredSkills: ["Event Setup & Ushering", "General Physical Labour"],
      jobType: "TEMPORARY",
      location: "Mall Road, Sirsa",
      latitude: 29.5400,
      longitude: 74.7214,
      payAmount: 850,
      payType: "DAILY",
      workersRequired: 2,
      status: "OPEN",
    },
    {
      employerIndex: 3, // GreenCity Artisan Bakery & Cafe (Fatehabad)
      title: "Cafe Barista & Beverage Host",
      description: "Brew espresso drinks, pour specialty teas, serve warm croissants to morning guests, and maintain espresso station hygiene.",
      category: "Hospitality",
      requiredSkills: ["Barista Skills", "Food Serving", "Customer Service"],
      jobType: "PART_TIME",
      location: "Barnala Road, Sirsa, Fatehabad",
      latitude: 29.5349,
      longitude: 75.0289,
      payAmount: 650,
      payType: "DAILY",
      workersRequired: 2,
      status: "OPEN",
    },
    {
      employerIndex: 3, // GreenCity Artisan Bakery & Cafe
      title: "Bakery Kitchen Prep Assistant",
      description: "Assist pastry chef with dough rolling, fruit cutting, tray cleaning, and packaging takeaway bakery boxes.",
      category: "Hospitality",
      requiredSkills: ["Kitchen Assistance", "Order Packing", "Food Serving"],
      jobType: "FLEXIBLE",
      location: "Barnala Road, Sirsa, Fatehabad",
      latitude: 29.5186,
      longitude: 75.4542,
      payAmount: 600,
      payType: "DAILY",
      workersRequired: 2,
      status: "OPEN",
    },
    {
      employerIndex: 4, // Malhotra Electronics (Sirsa)
      title: "Electronics Showroom Sales Executive",
      description: "Demonstrate LED smart TVs, refrigerators, and washing machines to walk-in families. Explain festive cashback offers and warranty details.",
      category: "Sales",
      requiredSkills: ["Counter Sales", "Customer Service", "Telecalling & Leads"],
      jobType: "FULL_TIME",
      location: "Chaura Bazar, Sirsa",
      latitude: 29.5349,
      longitude: 75.8541,
      payAmount: 18000,
      payType: "MONTHLY",
      workersRequired: 2,
      status: "OPEN",
    },
    {
      employerIndex: 4, // Malhotra Electronics
      title: "Appliance Installation & Unpacking Tech",
      description: "Accompany delivery tempo to customer homes to safely unbox, mount wall brackets, and plug in new air conditioners and microwave units.",
      category: "Repair & Maintenance",
      requiredSkills: ["Appliance Repair", "Residential Wiring", "General Physical Labour"],
      jobType: "FULL_TIME",
      location: "Chaura Bazar, Sirsa",
      latitude: 29.5349,
      longitude: 75.8541,
      payAmount: 800,
      payType: "DAILY",
      workersRequired: 3,
      status: "OPEN",
    },
    {
      employerIndex: 5, // Zenith Digital (Fatehabad)
      title: "Data Entry Operator (E-Commerce Catalog)",
      description: "Upload product specs, prices, and vendor descriptions into excel sheets and CMS portal. High accuracy and basic typing required.",
      category: "Data Entry",
      requiredSkills: ["Data Entry & Excel", "Computer Troubleshooting"],
      jobType: "PART_TIME",
      location: "Sector 66, Fatehabad",
      latitude: 29.5349,
      longitude: 75.0289,
      payAmount: 550,
      payType: "DAILY",
      workersRequired: 4,
      status: "OPEN",
    },
    {
      employerIndex: 5, // Zenith Digital
      title: "Social Media Creative & Reels Assistant",
      description: "Create eye-catching Canva graphics, write Hindi & English short captions, and schedule weekly promotional reels for local clients.",
      category: "Marketing",
      requiredSkills: ["Social Media Posting", "Graphic Design (Canva)"],
      jobType: "FLEXIBLE",
      location: "Sector 66, Fatehabad",
      latitude: 29.5186,
      longitude: 75.0289,
      payAmount: 750,
      payType: "DAILY",
      workersRequired: 1,
      status: "OPEN",
    },
    {
      employerIndex: 6, // Mehra Textiles (Sirsa)
      title: "Traditional Fabric Showroom Sales Assistant",
      description: "Show embroidered dupattas, Phulkari shawls, and suit fabrics to visiting wedding shoppers. Fold and keep displays pristine.",
      category: "Retail",
      requiredSkills: ["Counter Sales", "Store Display Setup", "Customer Service"],
      jobType: "FULL_TIME",
      location: "Hall Bazaar, Sirsa",
      latitude: 29.5210,
      longitude: 74.7214,
      payAmount: 15000,
      payType: "MONTHLY",
      workersRequired: 2,
      status: "OPEN",
    },
    {
      employerIndex: 6, // Mehra Textiles
      title: "Festive Parcel Packing & Dispatcher",
      description: "Wrap delicate silk items into protective bubble and parcel boxes for outstation courier shipping during peak Diwali festival.",
      category: "Logistics",
      requiredSkills: ["Order Packing", "Route Navigation"],
      jobType: "TEMPORARY",
      location: "Hall Bazaar, Sirsa",
      latitude: 29.5400,
      longitude: 75.0350,
      payAmount: 600,
      payType: "DAILY",
      workersRequired: 2,
      status: "OPEN",
    },
    {
      employerIndex: 7, // CarePlus Clinic (Jalandhar)
      title: "Front Desk Receptionist & Patient Scheduler",
      description: "Welcome arriving patients, register token numbers in software, answer incoming phone inquiries, and print diagnostic reports.",
      category: "Office Assistance",
      requiredSkills: ["Basic Receptionist", "Customer Service", "Data Entry & Excel"],
      jobType: "FULL_TIME",
      location: "DSP Road, Fatehabad",
      latitude: 29.5210,
      longitude: 75.5786,
      payAmount: 16000,
      payType: "MONTHLY",
      workersRequired: 1,
      status: "OPEN",
    },
    {
      employerIndex: 7, // CarePlus Clinic
      title: "Evening Sample Transport & Errand Runner",
      description: "Safely collect temperature-controlled pathology blood samples and transport them to the central lab in two-wheeler insulated box.",
      category: "Delivery",
      requiredSkills: ["Two-Wheeler Driving", "Route Navigation"],
      jobType: "PART_TIME",
      location: "DSP Road, Fatehabad",
      latitude: 29.5400,
      longitude: 75.5786,
      payAmount: 500,
      payType: "DAILY",
      workersRequired: 1,
      status: "OPEN",
    },
    {
      employerIndex: 8, // Dhillon Agri Organics (Jalandhar)
      title: "Cold Storage Stacking & Loading Worker",
      description: "Manage morning crate unloading of fresh potatoes and citrus fruit boxes. Inspect produce quality before dispatch.",
      category: "General Labour",
      requiredSkills: ["General Physical Labour", "Inventory Stocking"],
      jobType: "FULL_TIME",
      location: "GT Road, Jalandhar",
      latitude: 29.5210,
      longitude: 75.6174,
      payAmount: 700,
      payType: "DAILY",
      workersRequired: 5,
      status: "OPEN",
    },
    {
      employerIndex: 9, // PrintCraft Signage (Chandigarh)
      title: "Signboard & Acrylic Board Fabricator",
      description: "Assist master craftsman with mounting LED glow signboards, cutting vinyl letter stickers, and fixing flex banner hoardings.",
      category: "Construction",
      requiredSkills: ["Carpentry & Furniture Assembly", "Painting & Wall Finish", "General Physical Labour"],
      jobType: "FULL_TIME",
      location: "New Anaj Mandi, Fatehabad",
      latitude: 29.5186,
      longitude: 75.4542,
      payAmount: 850,
      payType: "DAILY",
      workersRequired: 2,
      status: "OPEN",
    },
    {
      employerIndex: 9, // PrintCraft Signage
      title: "Canva & Corel Graphic Trainee",
      description: "Design visiting cards, shop flyers, and social media announcements for walk-in business clients.",
      category: "Marketing",
      requiredSkills: ["Graphic Design (Canva)", "Social Media Posting"],
      jobType: "INTERNSHIP",
      location: "New Anaj Mandi, Fatehabad",
      latitude: 29.5349,
      longitude: 75.4542,
      payAmount: 8000,
      payType: "MONTHLY",
      workersRequired: 1,
      status: "OPEN",
    },
    {
      employerIndex: 10, // Mittal Hardware (Patiala)
      title: "Plumbing Fixture Store Sales Assistant",
      description: "Assist local plumbers and home contractors with selecting PVC pipes, valves, brass taps, and sanitaryware fitting parts.",
      category: "Retail",
      requiredSkills: ["Plumbing & Pipe Repair", "Counter Sales", "Billing & Cashiering"],
      jobType: "FULL_TIME",
      location: "Subhash Chowk, Sirsa",
      latitude: 29.5186,
      longitude: 75.4542,
      payAmount: 15500,
      payType: "MONTHLY",
      workersRequired: 2,
      status: "OPEN",
    },
    {
      employerIndex: 10, // Mittal Hardware
      title: "Hardware Warehouse Loading Assistant",
      description: "Handle heavy pipe bundles, ceramic basins, and adhesive bags. Safe stacking and vehicle loading.",
      category: "General Labour",
      requiredSkills: ["General Physical Labour", "Inventory Stocking"],
      jobType: "TEMPORARY",
      location: "Subhash Chowk, Sirsa",
      latitude: 29.5349,
      longitude: 75.0289,
      payAmount: 650,
      payType: "DAILY",
      workersRequired: 2,
      status: "OPEN",
    },
    {
      employerIndex: 11, // Royal Sood Caterers (Chandigarh)
      title: "Banquet Banquet Buffet Server & Food Runner",
      description: "Serve gourmet tandoori snacks and beverages at upscale family celebrations in Sector 34 club. Neat uniform provided.",
      category: "Hospitality",
      requiredSkills: ["Food Serving", "Catering Support", "Customer Service"],
      jobType: "GIG",
      location: "Civil Hospital Road, Sirsa",
      latitude: 29.5186,
      longitude: 75.0289,
      payAmount: 800,
      payType: "DAILY",
      workersRequired: 6,
      status: "OPEN",
    },
    {
      employerIndex: 11, // Royal Sood Caterers
      title: "Kitchen Stewarding & Utensil Helper",
      description: "Assist head chefs with washing commercial copper degchis, chopping onions/vegetables, and cleaning kitchen tables.",
      category: "Hospitality",
      requiredSkills: ["Kitchen Assistance", "General Physical Labour"],
      jobType: "TEMPORARY",
      location: "Civil Hospital Road, Sirsa",
      latitude: 29.5186,
      longitude: 75.4542,
      payAmount: 700,
      payType: "DAILY",
      workersRequired: 4,
      status: "OPEN",
    },
    {
      employerIndex: 0, // Haryana Logistics
      title: "Urgent Evening Parcel Sorter (4-hour shift)",
      description: "Quick 4-hour evening gig sorting returns and inward packages. Great for college students looking for quick cash.",
      category: "Logistics",
      requiredSkills: ["Order Packing", "Inventory Stocking"],
      jobType: "GIG",
      location: "GT Road, Fatehabad",
      latitude: 29.5349,
      longitude: 75.4542,
      payAmount: 400,
      payType: "DAILY",
      workersRequired: 3,
      status: "OPEN",
    },
    {
      employerIndex: 3, // GreenCity Cafe
      title: "Weekend Dishwashing & Cafe Cleaning Helper",
      description: "Keep crockery and coffee mugs sparkling clean during weekend rush. Meal provided during shift.",
      category: "Hospitality",
      requiredSkills: ["Kitchen Assistance", "General Physical Labour"],
      jobType: "PART_TIME",
      location: "Begu Road, Sirsa",
      latitude: 29.5186,
      longitude: 75.0289,
      payAmount: 500,
      payType: "DAILY",
      workersRequired: 1,
      status: "OPEN",
    },
    {
      employerIndex: 2, // Virasat Events
      title: "Stage Flower Decor & Garland Helper",
      description: "Assist traditional wedding florist with stringing marigold garlands and setting up stage backdrop floral arches.",
      category: "Events",
      requiredSkills: ["Event Setup & Ushering", "General Physical Labour"],
      jobType: "GIG",
      location: "Mall Road, Sirsa",
      latitude: 29.5400,
      longitude: 74.7214,
      payAmount: 750,
      payType: "DAILY",
      workersRequired: 3,
      status: "OPEN",
    },
    {
      employerIndex: 5, // Zenith Digital
      title: "Telecalling Representative (Student Admissions)",
      description: "Call prospective students from verified database to share scholarship exam dates. Polite telephone tone required.",
      category: "Sales",
      requiredSkills: ["Telecalling & Leads", "Customer Service"],
      jobType: "PART_TIME",
      location: "Sector 66, Fatehabad",
      latitude: 29.5349,
      longitude: 75.4542,
      payAmount: 600,
      payType: "DAILY",
      workersRequired: 2,
      status: "OPEN",
    },
    {
      employerIndex: 8, // Dhillon Agri Organics
      title: "Organic Farm Vegetable Packing & Labeling",
      description: "Weigh and pack organic farm carrots, peas, and tomatoes into eco-friendly bags and attach price labels.",
      category: "Logistics",
      requiredSkills: ["Order Packing", "Inventory Stocking"],
      jobType: "TEMPORARY",
      location: "GT Road, Jalandhar",
      latitude: 29.5400,
      longitude: 75.6174,
      payAmount: 650,
      payType: "DAILY",
      workersRequired: 4,
      status: "OPEN",
    },
    {
      employerIndex: 1, // Verma Departmental
      title: "Bicycle / Two-Wheeler Home Delivery Boy",
      description: "Deliver neighborhood phone orders within 3 km of store. Tips and fuel reimbursement included.",
      category: "Delivery",
      requiredSkills: ["Two-Wheeler Driving", "Route Navigation", "Customer Service"],
      jobType: "PART_TIME",
      location: "Model Town Market, Sirsa",
      latitude: 29.5349,
      longitude: 75.8273,
      payAmount: 550,
      payType: "DAILY",
      workersRequired: 2,
      status: "OPEN",
    },
    {
      employerIndex: 7, // CarePlus Clinic
      title: "Clinic Sanitization & Disinfection Attendant",
      description: "Ensure waiting room, consultation tables, and washrooms are sanitized following clinical protocol.",
      category: "General Labour",
      requiredSkills: ["General Physical Labour"],
      jobType: "PART_TIME",
      location: "DSP Road, Fatehabad",
      latitude: 29.5400,
      longitude: 75.5786,
      payAmount: 500,
      payType: "DAILY",
      workersRequired: 1,
      status: "OPEN",
    },
    {
      employerIndex: 4, // Malhotra Electronics
      title: "Showroom Security & Entry Temperature Screener",
      description: "Greet customers at main entrance, guide them to relevant floor, and maintain visitor entry registers.",
      category: "Retail",
      requiredSkills: ["Customer Service", "Basic Receptionist"],
      jobType: "FULL_TIME",
      location: "Chaura Bazar, Sirsa",
      latitude: 29.5186,
      longitude: 75.8541,
      payAmount: 13500,
      payType: "MONTHLY",
      workersRequired: 1,
      status: "OPEN",
    },
    {
      employerIndex: 9, // PrintCraft Signage
      title: "Vinyl Sticker & Signboard Application Helper",
      description: "Apply frosted films and decorative graphics on glass partitions of corporate offices in IT Park.",
      category: "Construction",
      requiredSkills: ["Painting & Wall Finish", "Carpentry & Furniture Assembly"],
      jobType: "TEMPORARY",
      location: "New Anaj Mandi, Fatehabad",
      latitude: 29.5186,
      longitude: 75.0289,
      payAmount: 800,
      payType: "DAILY",
      workersRequired: 2,
      status: "OPEN",
    },
  ];

  const createdJobs = [];
  for (const j of jobsData) {
    const emp = createdEmployers[j.employerIndex];
    if (!emp.employerProfile) continue;

    const job = await prisma.job.create({
      data: {
        employerId: emp.employerProfile.id,
        title: j.title,
        description: j.description,
        category: j.category,
        requiredSkills: JSON.stringify(j.requiredSkills),
        jobType: j.jobType,
        location: j.location,
        latitude: j.latitude,
        longitude: j.longitude,
        payAmount: j.payAmount,
        payType: j.payType,
        workersRequired: j.workersRequired,
        status: j.status,
      },
    });
    createdJobs.push(job);
  }
  console.log(`✅ Seeded ${createdJobs.length} jobs`);

  // 6. Seed Sample Applications (including demo worker applications)
  const demoWorker = createdWorkers[0];
  const demoEmployer = createdEmployers[0];
  const demoJob = createdJobs[0];

  // Application 1: Demo Worker applied to Job 0 (Hyperlocal Delivery Assistant)
  const app1 = await prisma.application.create({
    data: {
      jobId: demoJob.id,
      workerId: demoWorker.id,
      coverMessage: "I live 2 km away in Sector 15. I have my own Honda Activa, valid driving license, and Android smartphone. Ready to start immediately!",
      proposedPay: 700,
      status: "ACCEPTED",
    },
  });

  // Application 2: Demo Worker applied to Job 1 (Warehouse Helper)
  await prisma.application.create({
    data: {
      jobId: createdJobs[1].id,
      workerId: demoWorker.id,
      coverMessage: "Available for weekend shifts. Have experience with barcode scanning and box packing.",
      proposedPay: 16500,
      status: "SHORTLISTED",
    },
  });

  // Application 3: Demo Worker applied to Job 6 (Cafe Barista in Fatehabad)
  await prisma.application.create({
    data: {
      jobId: createdJobs[6].id,
      workerId: demoWorker.id,
      coverMessage: "Passionate about coffee brewing and customer service. Eager to work afternoon shifts.",
      proposedPay: 650,
      status: "PENDING",
    },
  });

  // Seed applications from other workers to make employer dashboards lively
  const otherWorkers = createdWorkers.slice(1, 10);
  for (let i = 0; i < otherWorkers.length; i++) {
    const targetJob = createdJobs[i % 5];
    const statuses = ["PENDING", "SHORTLISTED", "PENDING", "ACCEPTED", "REJECTED"];
    await prisma.application.create({
      data: {
        jobId: targetJob.id,
        workerId: otherWorkers[i].id,
        coverMessage: "Experienced and ready to join immediately. Reliable and punctual worker.",
        proposedPay: targetJob.payAmount,
        status: statuses[i % statuses.length],
      },
    });
  }
  console.log("✅ Seeded sample applications");

  // 7. Seed Active & Completed Work Assignments
  // Assignment 1: Between demoEmployer and demoWorker for Job 0
  const assignment1 = await prisma.workAssignment.create({
    data: {
      jobId: demoJob.id,
      workerId: demoWorker.id,
      employerId: demoEmployer.id,
      agreedAmount: 700,
      status: "IN_PROGRESS",
      completionStatus: "IN_PROGRESS",
    },
  });

  // Assignment 2: Completed assignment between demoEmployer and Worker 1 (Karan) for Job 1
  const assignment2 = await prisma.workAssignment.create({
    data: {
      jobId: createdJobs[1].id,
      workerId: createdWorkers[1].id,
      employerId: demoEmployer.id,
      agreedAmount: 16500,
      status: "PAID",
      completionStatus: "APPROVED",
    },
  });

  // 8. Seed Payment for completed assignment
  await prisma.payment.create({
    data: {
      assignmentId: assignment2.id,
      payerId: demoEmployer.id,
      receiverId: createdWorkers[1].id,
      amount: 16500,
      platformFee: 825, // 5% fee
      status: "SUCCESS",
      paymentMethod: "UPI",
      transactionId: `TXN_WA_INIT_${Date.now()}_001`,
    },
  });
  console.log("✅ Seeded Work Assignments & Payments");

  // 9. Seed Reviews
  await prisma.review.create({
    data: {
      reviewerId: demoEmployer.id,
      reviewedUserId: createdWorkers[1].id,
      jobId: createdJobs[1].id,
      rating: 5,
      comment: "Karan was outstanding! Organized our dispatch racks ahead of time and handled fragile shipments with great care.",
    },
  });

  await prisma.review.create({
    data: {
      reviewerId: createdWorkers[1].id,
      reviewedUserId: demoEmployer.id,
      jobId: createdJobs[1].id,
      rating: 5,
      comment: "Great workplace environment, supportive supervisor, and prompt on-time UPI payment.",
    },
  });
  console.log("✅ Seeded Reviews");

  // 10. Seed Notifications
  await prisma.notification.create({
    data: {
      userId: demoWorker.id,
      title: "Application Accepted! 🎉",
      message: `Haryana Logistics has accepted your application for 'Hyperlocal Delivery Assistant'. Work assignment has been started.`,
      type: "APPLICATION",
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: demoWorker.id,
      title: "Shortlisted for Warehouse Role",
      message: "Your application for 'Warehouse Inventory & Dispatch Helper' has been shortlisted.",
      type: "APPLICATION",
      isRead: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: demoEmployer.id,
      title: "New Application Received 📨",
      message: `${demoWorker.name} applied for 'Hyperlocal Delivery Assistant'.`,
      type: "APPLICATION",
      isRead: false,
    },
  });
  console.log("✅ Seeded Notifications");

  // 11. Seed Conversation & Messages
  const conversation = await prisma.conversation.create({
    data: {
      jobId: demoJob.id,
      workerId: demoWorker.id,
      employerId: demoEmployer.id,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: demoEmployer.id,
      message: "Hello Amanpreet, saw your application for the delivery role. Can you report to the Phase 1 hub tomorrow at 10 AM?",
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: demoWorker.id,
      message: "Yes sir, absolutely! I will be there with my vehicle and license by 9:45 AM.",
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: demoEmployer.id,
      message: "Excellent. See you tomorrow at the main gate!",
    },
  });
  console.log("✅ Seeded Conversation & Messages");

  // 12. Seed Community Reports for Admin Review
  await prisma.report.create({
    data: {
      reporterId: createdWorkers[2].id,
      jobId: createdJobs[4].id,
      reason: "Suspicious Contact Details",
      description: "Employer asking for registration fee before interview. Please verify.",
      status: "PENDING",
    },
  });
  console.log("✅ Seeded Community Reports");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
