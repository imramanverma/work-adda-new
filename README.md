# 🇮🇳 Work Adda - Hyperlocal Employment & Task Marketplace

**Work Adda** is a full-stack, hyper-responsive hyperlocal employment and task platform engineered for India's bustling gig economy. It bridges the gap between skilled workers (electricians, plumbers, delivery personnel, tutors, carpenters, daily tasks) and local employers/residents with instant job discovery, trust badges, verified profiles, and seamless work tracking.

---

## ✨ Features

- **⚡ Instant Radar Job Discovery**: Hyperlocal radar scan matching workers with gigs in their radius across Chandigarh, Mohali, Ludhiana, Amritsar, and beyond.
- **🛡️ Multi-Role Ecosystem**: Tailored dashboards and workflows for **Workers**, **Employers**, and **System Admins**.
- **📍 Live Task Pipeline**: End-to-end status lifecycle (`APPLIED` → `ASSIGNED` → `IN_PROGRESS` → `COMPLETED` → `PAID`).
- **💬 Real-Time Direct Messaging**: In-app messaging between employers and job applicants.
- **⭐ Reputation & Trust Badges**: Verified Aadhaar/Phone badges, star ratings, and community reviews.
- **📊 Admin Control Center**: Real-time analytics, job moderation, dispute resolution, and user management.
- **🎨 Glassmorphic Modern UI**: Built with Next.js 14 App Router, Tailwind CSS, Lucide icons, and fluid animations.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database ORM**: [Prisma ORM](https://www.prisma.io/) (SQLite for local dev, PostgreSQL for cloud deployment)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: Stateless JWT with secure HTTP-only cookies
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/<your-username>/work-adda.git
cd work-adda
npm install
```

### 2. Configure Environment
Create a `.env` file or copy from `.env.example`:
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="workadda-secret-key-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database & Seed
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🌐 Production Cloud Deployment Guide

Work Adda can be deployed in minutes to **Vercel** (Frontend & Serverless API) paired with a free cloud PostgreSQL database (**Neon.tech** or **Supabase**).

### Step 1: Create a Free PostgreSQL Database (Neon.tech or Supabase)

1. Sign up at [Neon.tech](https://neon.tech) (100% free serverless Postgres) or [Supabase.com](https://supabase.com).
2. Create a new project named `workadda`.
3. Copy your **PostgreSQL Connection String** (it looks like `postgresql://neondb_owner:xyz@ep-cool-sample.neon.tech/neondb?sslmode=require`).

---

### Step 2: Switch Prisma to PostgreSQL

Run the built-in deployment helper script:
```bash
npx tsx scripts/prepare-deploy.ts postgres
```
This updates `prisma/schema.prisma` to use `provider = "postgresql"`.

---

### Step 3: Push Code to GitHub

1. Create a new repository on [GitHub](https://github.com/new) named `work-adda`.
2. Push your code:
```bash
git remote add origin https://github.com/<your-username>/work-adda.git
git branch -M main
git push -u origin main
```

---

### Step 4: Deploy to Vercel

1. Log in to [Vercel](https://vercel.com) and click **"Add New" → "Project"**.
2. Import your `work-adda` GitHub repository.
3. In **Environment Variables**, add:
   - `DATABASE_URL`: Your PostgreSQL connection string from Neon / Supabase.
   - `JWT_SECRET`: A long random secret key.
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production URL (e.g. `https://work-adda.vercel.app`).
4. Click **Deploy**.

---

### Step 5: Initialize the Production Database

Once deployed, push the database schema from your terminal into your cloud database:
```bash
# In your local terminal with your Neon connection string in .env:
DATABASE_URL="postgresql://neondb_owner:xyz@ep-cool-sample.neon.tech/neondb?sslmode=require" npx prisma db push

# Optional: seed sample data
DATABASE_URL="postgresql://neondb_owner:xyz@ep-cool-sample.neon.tech/neondb?sslmode=require" npx prisma db seed
```

---

## 📂 Project Structure

```
WorkAdda/
├── app/                  # Next.js 14 App Router routes & layouts
│   ├── (auth)/login      # Worker & Employer authentication
│   ├── (auth)/register   # Registration with role selection
│   ├── admin/            # Administrative dashboard & analytics
│   ├── employer/         # Employer job posting & worker management
│   ├── worker/           # Worker applications, earnings, & jobs
│   ├── jobs/             # Job catalog & detailed job views
│   └── api/              # Full REST API endpoints
├── components/           # Reusable UI widgets & animated components
├── lib/                  # Auth, prisma client, utils, & validation
├── prisma/               # Schema definitions & database seeds
└── scripts/              # Audit, test, & deployment automation
```

---

## 📄 License
MIT License. Built with ❤️ for empowering local communities.
