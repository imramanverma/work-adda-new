"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import {
  Briefcase,
  MapPin,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Award,
  ChevronRight,
  CheckCircle2,
  Users,
  Search,
  Building2,
  ArrowRight,
  Sparkles,
  Star,
  IndianRupee,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

export default function HomePage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"worker" | "employer">("worker");
  const [heroSearch, setHeroSearch] = useState("");
  const [heroLocation, setHeroLocation] = useState("Fatehabad");
  const [platformStats, setPlatformStats] = useState<{
    totalWorkers: number;
    totalBusinesses: number;
    openJobs: number;
    completedTasks: number;
    totalSettledAmount: number;
    categoryCounts: Record<string, number>;
    latestJob: any | null;
  }>({
    totalWorkers: 0,
    totalBusinesses: 0,
    openJobs: 0,
    completedTasks: 0,
    totalSettledAmount: 0,
    categoryCounts: {},
    latestJob: null,
  });
  const [reviews, setReviews] = useState<any[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch featured jobs
    fetch("/api/jobs?limit=3&sortBy=highest_pay")
      .then((r) => r.json())
      .then((d) => setFeaturedJobs(d.jobs || []))
      .catch(() => {});

    // 2. Fetch platform live stats
    fetch("/api/platform/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.stats) {
          setPlatformStats(d.stats);
        }
      })
      .catch(() => {});

    // 3. Fetch real reviews
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews || []))
      .catch(() => {});
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroSearch) params.set("q", heroSearch);
    if (heroLocation) params.set("location", heroLocation);
    router.push(`/jobs?${params.toString()}`);
  };

  const categories = [
    { name: "Delivery & Courier", key: "Delivery", icon: "🛵", bg: "from-blue-500/10 to-blue-500/5", border: "hover:border-blue-300" },
    { name: "Retail & Stores", key: "Retail", icon: "🏪", bg: "from-emerald-500/10 to-emerald-500/5", border: "hover:border-emerald-300" },
    { name: "Events & Catering", key: "Events", icon: "🎪", bg: "from-amber-500/10 to-amber-500/5", border: "hover:border-amber-300" },
    { name: "Hospitality & Cafe", key: "Hospitality", icon: "☕", bg: "from-rose-500/10 to-rose-500/5", border: "hover:border-rose-300" },
    { name: "Warehouse Logistics", key: "Logistics", icon: "📦", bg: "from-indigo-500/10 to-indigo-500/5", border: "hover:border-indigo-300" },
    { name: "Data Entry & Office", key: "Data Entry", icon: "💻", bg: "from-cyan-500/10 to-cyan-500/5", border: "hover:border-cyan-300" },
    { name: "Technicians & Repair", key: "Repair & Maintenance", icon: "🔧", bg: "from-orange-500/10 to-orange-500/5", border: "hover:border-orange-300" },
    { name: "Sales & Promoters", key: "Sales", icon: "📈", bg: "from-purple-500/10 to-purple-500/5", border: "hover:border-purple-300" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/80 via-white to-slate-50 pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200">
        {/* Decorative Background Mesh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-80px] left-1/4 w-[500px] h-[500px] bg-brand-400/10 rounded-full blur-3xl" />
          <div className="absolute top-[100px] right-1/4 w-[400px] h-[400px] bg-accent-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Hero Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Pop Logo Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-200 shadow-sm shadow-brand-500/10">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black text-brand-900 tracking-wide uppercase">
                  {t("brand.badge")}
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                {t("brand.hero_title_1")} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-brand-600 to-accent-600">
                  {t("brand.hero_title_2")}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                {t("brand.hero_desc")}
              </p>

              {/* Interactive Search Bar in Hero */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-white p-2 rounded-2xl sm:rounded-full border-2 border-brand-200 shadow-lg shadow-brand-500/10 flex flex-col sm:flex-row items-center gap-2 max-w-2xl"
              >
                <div className="flex items-center gap-2 px-4 py-2 w-full sm:w-auto flex-1">
                  <Search className="w-4 h-4 text-brand-600 shrink-0" />
                  <input
                    type="text"
                    placeholder={t("hero.search_input")}
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    className="w-full text-xs sm:text-sm focus:outline-none text-slate-900 bg-transparent placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2 px-4 py-2 border-t sm:border-t-0 sm:border-l border-slate-200 w-full sm:w-auto">
                  <MapPin className="w-4 h-4 text-accent-500 shrink-0" />
                  <select
                    value={heroLocation}
                    onChange={(e) => setHeroLocation(e.target.value)}
                    className="text-xs sm:text-sm font-semibold text-slate-700 bg-transparent focus:outline-none"
                  >
                    <option value="Fatehabad">Fatehabad</option>
                    <option value="Sirsa">Sirsa</option>
                  </select>
                </div>

                <Button type="submit" size="md" className="w-full sm:w-auto font-bold rounded-xl sm:rounded-full px-6">
                  {t("hero.search_btn")}
                </Button>
              </form>

              {/* Social Proof Strip - 100% Dynamic Database Values */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 text-xs text-slate-600">
                {platformStats.totalWorkers > 0 || platformStats.totalBusinesses > 0 ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100/90 text-slate-700 font-semibold border border-slate-200">
                    <Users className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>
                      {language === "hi" ? (
                        <>
                          <strong className="text-slate-900">{platformStats.totalWorkers}</strong> सत्यापित कामगार व{" "}
                          <strong className="text-slate-900">{platformStats.totalBusinesses}</strong> पंजीकृत व्यापार
                        </>
                      ) : (
                        <>
                          <strong className="text-slate-900">{platformStats.totalWorkers}</strong> verified workers &{" "}
                          <strong className="text-slate-900">{platformStats.totalBusinesses}</strong> local businesses registered
                        </>
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>
                      {language === "hi"
                        ? "फतेहाबाद व सिरसा का पहला हाइपरलोकल रोजगार नेटवर्क • 100% सत्यापित"
                        : "Fatehabad & Sirsa's Verified Employment Network • Direct & Hyperlocal"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Dynamic Visual Card with Authentic Capability Badges */}
            <div className="lg:col-span-5 relative pt-6 pb-8 px-1 sm:px-3">
              {/* Floating Region Verification Badge */}
              <div className="absolute -top-4 sm:-top-5 left-3 sm:left-6 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-brand-200/90 shadow-xl shadow-brand-500/15 flex items-center gap-2.5 animate-float-slow">
                <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <span className="font-black text-xs sm:text-sm text-slate-900 block leading-tight">
                    {language === "hi" ? "हाइपरलोकल नेटवर्क" : "Hyperlocal Network"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Fatehabad & Sirsa, Haryana</span>
                </div>
              </div>

              {/* Main Feature Showcase Card - Real Database Job or Inviting Empty State */}
              <div className="bg-white rounded-3xl border-2 border-slate-200/90 p-6 pt-7 pb-10 sm:pb-12 shadow-2xl shadow-slate-300/40 space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-slate-400 ml-2">Work Adda Live Feed</span>
                  </div>
                  <Badge variant="brand" className="text-[10px] font-bold">
                    {platformStats.latestJob ? "● Active Dispatch" : "● Network Ready"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {platformStats.latestJob ? (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="brand">{platformStats.latestJob.category}</Badge>
                        <span className="font-black text-sm text-emerald-600">
                          {formatCurrency(platformStats.latestJob.payAmount)}/{platformStats.latestJob.payType.toLowerCase()}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                        {platformStats.latestJob.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{platformStats.latestJob.employer?.businessName || "Local Employer"}</span>
                        <span>•</span>
                        <span className="text-brand-700 font-bold">{platformStats.latestJob.location}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-gradient-to-br from-brand-50/40 via-white to-slate-50 rounded-2xl border border-dashed border-brand-200 text-center space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 mx-auto flex items-center justify-center">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {language === "hi" ? "पहला काम पोस्ट करें या खोजें" : "Be the First to Post or Apply"}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                        {language === "hi"
                          ? "फतेहाबाद व सिरसा में असली कामगारों और व्यापारियों को सीधे जोड़ें।"
                          : "Connect directly with authentic local workers and verified businesses across Fatehabad & Sirsa."}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100">
                      <span className="text-slate-400 block text-[10px]">{t("hero.hiring_time_label")}</span>
                      <span className="font-bold text-brand-900">{t("hero.hiring_time_val")}</span>
                    </div>
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">{t("hero.fee_label")}</span>
                      <span className="font-bold text-accent-900">{t("hero.fee_val")}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <Link href={platformStats.latestJob ? `/jobs/${platformStats.latestJob.id}` : "/jobs"} className="block pt-1">
                  <Button size="md" variant="primary" className="w-full font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 flex items-center justify-center gap-2">
                    <span>
                      {platformStats.openJobs > 0
                        ? (language === "hi" ? `अभी ${platformStats.openJobs} खुले काम देखें` : `Explore ${platformStats.openJobs} Open Gigs Now`)
                        : (language === "hi" ? "काम पोस्ट करें या काम ढूंढें" : "Post Work or Explore Jobs")}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {/* Floating Payment Security Badge */}
              <div className="absolute -bottom-4 sm:-bottom-5 -right-2 sm:-right-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-blue-200/90 shadow-xl shadow-blue-500/15 flex items-center gap-2.5 animate-float-delayed">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <span className="font-black text-xs sm:text-sm text-slate-900 block leading-tight">
                    {language === "hi" ? "सुरक्षित भुगतान" : "Direct Settlements"}
                  </span>
                  <span className="text-[10px] text-brand-600 font-bold">
                    {platformStats.totalSettledAmount > 0
                      ? `₹${platformStats.totalSettledAmount.toLocaleString()} ${language === "hi" ? "जारी हुआ" : "Settled"}`
                      : (language === "hi" ? "शून्य बिचौलिया • 100% पारदर्शी" : "Zero Middlemen • 100% Escrow")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories with Gradient Badges */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-brand-600">
                {language === "hi" ? "विविध अवसर" : "Diverse Opportunities"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {language === "hi" ? "श्रेणी अनुसार काम खोजें" : "Explore Work by Category"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {language === "hi"
                  ? "छात्र पार्ट-टाइम काम से लेकर रीटेल, लॉजिस्टिक्स व स्थानीय व्यवसायों तक।"
                  : "From student part-time gigs to full-time trades across retail, logistics, and hospitality."}
              </p>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group shrink-0"
            >
              {language === "hi" ? "सभी श्रेणियां देखें" : "Browse All Categories"}{" "}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((c, i) => {
              const count = platformStats.categoryCounts[c.key] || 0;
              return (
                <Link
                  key={i}
                  href={`/jobs?category=${encodeURIComponent(c.key)}`}
                  className={`p-5 rounded-2xl border border-slate-200 bg-gradient-to-br ${c.bg} ${c.border} hover:shadow-md transition-all group`}
                >
                  <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">
                    {c.icon}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition">
                    {c.name}
                  </h4>
                  <span className="text-xs text-slate-500 font-medium mt-1 block">
                    {count > 0
                      ? (language === "hi" ? `${count} काम उपलब्ध` : `${count} Open ${count === 1 ? "Gig" : "Gigs"}`)
                      : (language === "hi" ? "कोई काम उपलब्ध नहीं" : "0 Open Gigs")}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Featured Live Jobs Preview */}
      {featuredJobs.length > 0 && (
        <section className="py-16 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-brand-600">
                  Hot Local Positions
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Featured High-Comp Jobs
                </h3>
              </div>
              <Link href="/jobs">
                <Button size="sm" variant="outline">
                  View All Listings
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-brand-300 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="brand">{job.category}</Badge>
                      <span className="font-black text-base text-slate-900">
                        {formatCurrency(job.payAmount)}
                        <span className="text-xs font-normal text-slate-500">/{job.payType.toLowerCase()}</span>
                      </span>
                    </div>

                    <Link href={`/jobs/${job.id}`}>
                      <h4 className="font-bold text-base text-slate-900 hover:text-brand-600 transition line-clamp-2">
                        {job.title}
                      </h4>
                    </Link>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {job.applicantsCount || 0} applied
                    </span>
                    <Link href={`/jobs/${job.id}`}>
                      <Button size="sm" variant="primary">
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. How It Works Interactive Tabs */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-600">
              Clear & Straightforward
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">How Work Adda Works</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              From finding a shift to getting paid into your UPI account.
            </p>

            <div className="mt-6 inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                onClick={() => setActiveTab("worker")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "worker"
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                For Job Seekers & Workers
              </button>
              <button
                onClick={() => setActiveTab("employer")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "employer"
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                For Businesses & Employers
              </button>
            </div>
          </div>

          {activeTab === "worker" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { step: "01", title: "Create Profile", desc: "Add skills, availability, and commute radius." },
                { step: "02", title: "Discover Work", desc: "Filter jobs by distance (2–25 km) & see match scores." },
                { step: "03", title: "1-Click Apply", desc: "Send your pitch and proposed pay directly." },
                { step: "04", title: "Get Hired", desc: "Employer accepts and your work contract begins." },
                { step: "05", title: "Complete Work", desc: "Perform the task and mark completion in your hub." },
                { step: "06", title: "Get Paid & Rated", desc: "Instant UPI payout release and reputation boost." },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between hover:border-brand-300 hover:shadow-md transition"
                >
                  <span className="text-2xl font-black text-brand-600/40">{item.step}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-3">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { step: "01", title: "Post Work", desc: "Specify required skills, shift hours, and compensation." },
                { step: "02", title: "Review Talent", desc: "Inspect candidate ratings and past completed gigs." },
                { step: "03", title: "Shortlist", desc: "Bookmark top candidates or message in built-in chat." },
                { step: "04", title: "Hire & Assign", desc: "Accept candidate to establish an active contract." },
                { step: "05", title: "Approve Task", desc: "Inspect the worker's submitted completion." },
                { step: "06", title: "Pay & Review", desc: "Release verified payment and rate worker's quality." },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200 flex flex-col justify-between hover:shadow-md transition"
                >
                  <span className="text-2xl font-black text-accent-600/40">{item.step}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-3">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Community Testimonials */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-600">
              Community Voices
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Loved by Local Workers & Businesses
            </h3>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {Array.from({ length: review.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{review.comment}"
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                      {review.reviewer?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">{review.reviewer?.name || "Verified Member"}</h5>
                      <span className="text-[10px] text-slate-400">
                        {review.reviewer?.employerProfile?.businessName || review.job?.title || "Community Member"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs text-center max-w-xl mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">
                {language === "hi" ? "सत्यापित कार्य समीक्षाएं" : "Verified Community Reviews"}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {language === "hi"
                  ? "समीक्षाएं केवल फतेहाबाद व सिरसा में पूरे किए गए कार्यों और सत्यापित अनुबंधों के बाद ही दर्ज की जाती हैं। पहला काम पूरा करें और अपनी पहली रेटिंग प्राप्त करें!"
                  : "Reviews are recorded exclusively upon verified completion of contracts between local employers and workers in Fatehabad & Sirsa. Complete your first gig to earn verified ratings!"}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link href="/jobs">
                  <Button size="sm" variant="outline" className="font-semibold">
                    {language === "hi" ? "लोकल काम देखें" : "Explore Local Jobs"}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="primary" className="font-semibold">
                    {language === "hi" ? "खाता बनाएं" : "Create Free Account"}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. High-Impact Call To Action */}
      <section className="bg-gradient-to-r from-brand-900 via-brand-800 to-slate-950 text-white py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <Badge variant="brand" className="bg-white/10 text-white border-white/20">
            Join the Local Movement
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Your next opportunity could be <br className="hidden sm:block" /> just around the corner.
          </h2>
          <p className="text-xs sm:text-base text-brand-100 max-w-xl mx-auto leading-relaxed">
            Start earning, hiring, and growing together with your local community on Work Adda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link href="/register">
              <Button size="lg" variant="accent" className="font-bold px-8 shadow-xl shadow-accent-500/25">
                Join Work Adda for Free <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white/10 px-8">
                Explore All Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
