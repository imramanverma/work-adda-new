import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Work Adda production database seeding...");

  // 1. Seed Master Skills Catalog if missing
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
    await prisma.skill.upsert({
      where: { name: s.name },
      update: { category: s.category },
      create: s,
    });
  }
  console.log(`✅ Verified ${skillsData.length} master skills.`);

  // 2. Ensure Official Admin Account Exists
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
  console.log("🚀 Production seed complete: Zero fake users, zero fake jobs.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
