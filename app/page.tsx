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
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatJobPay } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { AnimatedAurora } from "@/components/ui/animated-aurora";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"worker" | "employer">("worker");

  useEffect(() => {
    if (user?.role === "EMPLOYER") {
      setActiveTab("employer");
    } else if (user?.role === "WORKER") {
      setActiveTab("worker");
    }
  }, [user?.role]);
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
    { name: "Assignment & Academic", key: "Academic & Assignment Work", icon: "📚", bg: "from-blue-500/10 to-indigo-500/5", border: "hover:border-blue-400 ring-1 ring-blue-500/20" },
    { name: "Local Business & Retail", key: "Local Business Jobs", icon: "🏪", bg: "from-emerald-500/10 to-emerald-500/5", border: "hover:border-emerald-300" },
    { name: "Digital & Computer", key: "Digital Work", icon: "💻", bg: "from-cyan-500/10 to-cyan-500/5", border: "hover:border-cyan-300" },
    { name: "Delivery & Errands", key: "Delivery & Errands", icon: "🛵", bg: "from-amber-500/10 to-amber-500/5", border: "hover:border-amber-300" },
    { name: "Skilled Trades & Repair", key: "Skilled Work", icon: "🔧", bg: "from-orange-500/10 to-orange-500/5", border: "hover:border-orange-300" },
    { name: "Household Services", key: "Household Services", icon: "🏠", bg: "from-rose-500/10 to-rose-500/5", border: "hover:border-rose-300" },
    { name: "Creative & Media", key: "Creative Work", icon: "🎨", bg: "from-purple-500/10 to-purple-500/5", border: "hover:border-purple-300" },
    { name: "Tutoring & Education", key: "Tutoring & Education", icon: "🎓", bg: "from-emerald-600/10 to-green-500/5", border: "hover:border-emerald-300" },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
      {/* 1. Enhanced Hero Section with Animated Ambient Background */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-20 sm:pb-28 border-b border-slate-200 w-full max-w-full">
        {/* Dynamic Multi-Layer Animated Mesh Background */}
        <AnimatedBackground intensity="hero" showGrid={true} showParticles={true} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Col: Hero Value Proposition */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              {/* Pop Logo Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-200 shadow-sm shadow-brand-500/10">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black text-brand-900 tracking-wide uppercase">
                  {t("brand.badge")}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.14] sm:leading-[1.12]">
                {t("brand.hero_title_1")} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-brand-600 to-accent-600">
                  {t("brand.hero_title_2")}
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                {t("brand.hero_desc")}
              </p>

              {/* Interactive Search Bar in Hero */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-white p-2 rounded-2xl sm:rounded-full border-2 border-brand-200 shadow-lg shadow-brand-500/10 flex flex-col sm:flex-row items-center gap-2 max-w-2xl"
              >
                <div className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 w-full sm:w-auto flex-1">
                  <Search className="w-4 h-4 text-brand-600 shrink-0" />
                  <input
                    type="text"
                    placeholder={t("hero.search_input")}
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    className="w-full text-sm focus:outline-none text-slate-900 bg-transparent placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 border-t sm:border-t-0 sm:border-l border-slate-200 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent-500 shrink-0" />
                    <select
                      value={heroLocation}
                      onChange={(e) => setHeroLocation(e.target.value)}
                      className="text-xs sm:text-sm font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="Fatehabad">Fatehabad</option>
                      <option value="Sirsa">Sirsa</option>
                      <option value="Hisar">Hisar</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" size="md" className="w-full sm:w-auto font-bold rounded-xl sm:rounded-full px-6 py-2.5 sm:py-2 text-xs sm:text-sm shadow-xs">
                  {t("hero.search_btn")}
                </Button>
              </form>

              {/* Social Proof Strip - 100% Dynamic Database Values */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1 sm:pt-2 text-xs text-slate-600">
                {platformStats.totalWorkers > 0 || platformStats.totalBusinesses > 0 ? (
                  <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-100/90 text-slate-700 font-semibold border border-slate-200 text-[11px] sm:text-xs">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600 shrink-0" />
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
                  <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 font-semibold text-[11px] sm:text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600 shrink-0" />
                    <span>
                      {language === "hi"
                        ? "फतेहाबाद, सिरसा व हिसार का पहला हाइपरलोकल रोजगार नेटवर्क • 100% सत्यापित"
                        : "Fatehabad, Sirsa & Hisar's Verified Employment Network • Direct & Hyperlocal"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Dynamic Visual Card with Authentic Capability Badges */}
            <div className="lg:col-span-5 relative pt-6 pb-8 px-1 sm:px-3">
              {/* Floating Region Verification Badge */}
              <div className="absolute -top-3.5 sm:-top-5 left-2 sm:left-6 z-20 bg-white/95 backdrop-blur-md px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl border border-brand-200/90 shadow-xl shadow-brand-500/15 flex items-center gap-2 sm:gap-2.5 animate-float-slow max-w-[calc(100%-1rem)]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600" />
                </div>
                <div>
                  <span className="font-black text-xs sm:text-sm text-slate-900 block leading-tight">
                    {language === "hi" ? "हाइपरलोकल नेटवर्क" : "Hyperlocal Network"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium truncate block max-w-[180px] sm:max-w-none">Fatehabad, Sirsa & Hisar, Haryana</span>
                </div>
              </div>

              {/* Main Feature Showcase Card with Animated Glow Aura */}
              <div className="relative group w-full max-w-full">
                <div className="absolute inset-0 sm:-inset-1.5 bg-gradient-to-r from-brand-600 via-accent-400 to-emerald-500 rounded-2xl sm:rounded-[32px] blur-md sm:blur-xl opacity-25 group-hover:opacity-45 transition duration-1000 animate-pulse-slow" />
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border-2 border-white/90 p-4 sm:p-6 pt-7 sm:pt-7 pb-10 sm:pb-12 shadow-2xl shadow-slate-300/40 space-y-3.5 sm:space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-slate-400 ml-2">Work Adda Live Feed</span>
                  </div>
                  <Badge variant={user?.role === "EMPLOYER" ? "warning" : "brand"} className="text-[10px] font-bold">
                    {user?.role === "EMPLOYER"
                      ? (language === "hi" ? "● एंप्लॉयर हायरिंग" : "● Employer Hiring")
                      : user?.role === "WORKER"
                      ? (platformStats.latestJob ? (language === "hi" ? "● नया काम उपलब्ध" : "● Active Gigs") : (language === "hi" ? "● कामगार हब" : "● Worker Hub"))
                      : (platformStats.latestJob ? "● Active Dispatch" : "● Network Ready")}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {user?.role === "EMPLOYER" ? (
                    <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="warning">{language === "hi" ? "हायरिंग सहायता" : "Instant Hiring"}</Badge>
                        <span className="font-black text-sm text-brand-700">
                          {platformStats.totalWorkers > 0 ? `${platformStats.totalWorkers}+ ${language === "hi" ? "सत्यापित कामगार" : "Verified Workers"}` : (language === "hi" ? "सत्यापित नेटवर्क" : "Verified Talent")}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                        {language === "hi" ? "असाइनमेंट, दुकान, डिलीवरी या फील्ड टास्क पोस्ट करें" : "Post for Assignments, Shop, Delivery or Gigs"}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{user.name || "Local Employer"}</span>
                        <span>•</span>
                        <span className="text-brand-700 font-bold">{user.location || "Fatehabad, Sirsa & Hisar"}</span>
                      </div>
                    </div>
                  ) : platformStats.latestJob ? (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="brand">{platformStats.latestJob.category}</Badge>
                        <span className="font-black text-sm text-emerald-600">
                          {platformStats.latestJob.budgetType === "PER_PAGE" || platformStats.latestJob.payType === "PER_PAGE"
                            ? `₹${platformStats.latestJob.pricePerUnit || 3}/page`
                            : `${formatCurrency(platformStats.latestJob.payAmount)}/${platformStats.latestJob.payType?.toLowerCase()?.replace("_", " ")}`}
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
                        {user?.role === "WORKER"
                          ? (language === "hi" ? "लोकल काम खोजें और आवेदन करें" : "Explore & Apply for Local Gigs")
                          : (language === "hi" ? "पहला काम पोस्ट करें या खोजें" : "Be the First to Post or Apply")}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                        {user?.role === "WORKER"
                          ? (language === "hi"
                            ? "फतेहाबाद, सिरसा व हिसार में सत्यापित नियोक्ताओं से सीधे जुड़ें और 100% सुरक्षित भुगतान पाएं।"
                            : "Connect directly with verified hirers across Fatehabad, Sirsa & Hisar with guaranteed payments.")
                          : (language === "hi"
                            ? "फतेहाबाद, सिरसा व हिसार में असली कामगारों और व्यापारियों को सीधे जोड़ें।"
                            : "Connect directly with authentic local workers and verified businesses across Fatehabad, Sirsa & Hisar.")}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100">
                      <span className="text-slate-400 block text-[10px]">
                        {user?.role === "EMPLOYER"
                          ? (language === "hi" ? "औसत हायरिंग समय" : "Avg Hire Time")
                          : t("hero.hiring_time_label")}
                      </span>
                      <span className="font-bold text-brand-900">
                        {user?.role === "EMPLOYER"
                          ? (language === "hi" ? "15 मिनट में" : "Within 15 mins")
                          : t("hero.hiring_time_val")}
                      </span>
                    </div>
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex flex-col justify-between">
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          {user?.role === "EMPLOYER"
                            ? (language === "hi" ? "भुगतान सुरक्षा" : "Payment Security")
                            : t("hero.fee_label")}
                        </span>
                        <span className="font-bold text-accent-900 block">
                          {user?.role === "EMPLOYER"
                            ? (language === "hi" ? "100% एस्क्रो सुरक्षित" : "100% Escrow")
                            : t("hero.fee_val")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-amber-200/50 text-[9px] text-slate-500 font-semibold">
                        <span className="px-1.5 py-0.5 rounded bg-[#0C2340] text-white text-[8px] font-bold">Razorpay</span>
                        <span>Direct UPI Payouts</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button(s) - Strictly Role Separated */}
                {user?.role === "WORKER" ? (
                  <Link href={platformStats.latestJob ? `/jobs/${platformStats.latestJob.id}` : "/jobs"} className="block pt-1">
                    <Button
                      size="md"
                      variant="primary"
                      className="w-full font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>
                        {platformStats.openJobs > 0
                          ? (language === "hi" ? `अभी ${platformStats.openJobs} काम देखें` : `Explore ${platformStats.openJobs} Open Gigs Now`)
                          : (language === "hi" ? "उपलब्ध काम और नौकरियां देखें" : "Explore Available Jobs")}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : user?.role === "EMPLOYER" ? (
                  <div className="space-y-1.5 pt-1">
                    <Link href="/employer/jobs/new" className="block">
                      <Button
                        size="md"
                        variant="accent"
                        className="w-full font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center justify-center gap-2 text-slate-950 bg-amber-400 hover:bg-amber-500"
                      >
                        <PlusCircle className="w-4 h-4 text-slate-950" />
                        <span>
                          {language === "hi" ? "नया काम / गिग पोस्ट करें" : "Post a New Job / Task"}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-950" />
                      </Button>
                    </Link>
                    <Link href="/employer/dashboard" className="block text-center text-xs font-bold text-brand-600 hover:text-brand-800 transition">
                      {language === "hi" ? "एंप्लॉयर डैशबोर्ड खोलें →" : "View Employer Dashboard →"}
                    </Link>
                  </div>
                ) : user?.role === "BOTH" ? (
                  <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Link href="/jobs">
                      <Button
                        size="md"
                        variant="primary"
                        className="w-full font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>{language === "hi" ? "काम खोजें" : "Explore Jobs"}</span>
                      </Button>
                    </Link>
                    <Link href="/employer/jobs/new">
                      <Button
                        size="md"
                        variant="accent"
                        className="w-full font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-xs flex items-center justify-center gap-1.5 text-slate-950 bg-amber-400 hover:bg-amber-500"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>{language === "hi" ? "काम पोस्ट करें" : "Post a Job"}</span>
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Link href="/jobs">
                      <Button
                        size="md"
                        variant="primary"
                        className="w-full font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 flex items-center justify-center gap-1.5"
                      >
                        <Search className="w-4 h-4" />
                        <span>
                          {platformStats.openJobs > 0
                            ? (language === "hi" ? `काम खोजें (${platformStats.openJobs})` : `Explore Jobs (${platformStats.openJobs})`)
                            : (language === "hi" ? "काम खोजें" : "Explore Jobs")}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Link href="/employer/jobs/new">
                      <Button
                        size="md"
                        variant="outline"
                        className="w-full font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl border-brand-300 hover:bg-brand-50 text-brand-800 flex items-center justify-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4 text-brand-600" />
                        <span>{language === "hi" ? "काम पोस्ट करें" : "Post a Job / Task"}</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

              {/* Floating Payment Security Badge */}
              <div className="absolute -bottom-3.5 sm:-bottom-5 right-2 sm:right-2 z-20 bg-white/95 backdrop-blur-md px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl border border-blue-200/90 shadow-xl shadow-blue-500/15 flex items-center gap-2 sm:gap-2.5 animate-float-delayed max-w-[calc(100%-1rem)]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-100 text-brand-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600" />
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

      {/* Hyperlocal Task / Work Banner - Role Tailored */}
      <section className="bg-gradient-to-r from-slate-950 via-brand-950 to-slate-900 py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800 text-white relative overflow-hidden w-full max-w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 text-accent-300 text-[11px] sm:text-xs font-bold border border-accent-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              {user?.role === "WORKER"
                ? (language === "hi" ? "कामगारों के लिए 100% फ्री • सीधे UPI भुगतान • एस्क्रो सुरक्षित" : "100% Free for Workers • Direct UPI Payouts • Escrow Protected")
                : (language === "hi" ? "तेज हायरिंग • लोकल व रिमोट • 100% एस्क्रो सुरक्षा" : "Fast Hiring • Local & Remote • 100% Escrow Protected")}
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              {user?.role === "WORKER"
                ? (language === "hi" ? "अपनी सुविधा अनुसार लोकल काम करें और कमाएं" : "Ready to earn money on your own schedule?")
                : user?.role === "EMPLOYER"
                ? (language === "hi" ? "आपको किस काम के लिए कामगार चाहिए?" : "What work do you need done?")
                : (language === "hi" ? "लोकल कामगार रखें या काम ढूंढें" : "Need Work Done or Looking for Gigs?")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
              {language === "hi"
                ? "असाइनमेंट राइटिंग • दुकान • डिलीवरी • कंप्यूटर • होम ट्यूशन • रिपेयर • पार्ट-टाइम वर्क"
                : "Assignment • Delivery • Design • Data Entry • Tutoring • Repair • Shop Work • Household Work • Freelance Tasks"}
            </p>
          </div>

          <div className="flex items-center justify-center w-full md:w-auto gap-3 shrink-0">
            {user?.role === "WORKER" ? (
              <Link href="/jobs" className="w-full sm:w-auto">
                <Button size="lg" variant="accent" className="w-full sm:w-auto font-extrabold px-8 shadow-xl shadow-accent-500/20 text-slate-950">
                  {language === "hi" ? "उपलब्ध काम देखें →" : "Browse Available Jobs →"}
                </Button>
              </Link>
            ) : user?.role === "EMPLOYER" ? (
              <Link href="/employer/jobs/new" className="w-full sm:w-auto">
                <Button size="lg" variant="accent" className="w-full sm:w-auto font-extrabold px-8 shadow-xl shadow-accent-500/20 text-slate-950">
                  {language === "hi" ? "काम / टास्क पोस्ट करें →" : "Post a Job / Task Now →"}
                </Button>
              </Link>
            ) : user?.role === "BOTH" ? (
              <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-2.5">
                <Link href="/employer/jobs/new" className="w-full sm:w-auto">
                  <Button size="lg" variant="accent" className="w-full sm:w-auto font-extrabold px-6 shadow-xl shadow-accent-500/20 text-slate-950">
                    {language === "hi" ? "काम पोस्ट करें →" : "Post a Job →"}
                  </Button>
                </Link>
                <Link href="/jobs" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold px-6 bg-white/10 hover:bg-white/20 text-white border-white/30">
                    {language === "hi" ? "काम खोजें →" : "Find Work →"}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-2.5">
                <Link href="/employer/jobs/new" className="w-full sm:w-auto">
                  <Button size="lg" variant="accent" className="w-full sm:w-auto font-extrabold px-6 shadow-xl shadow-accent-500/20 text-slate-950">
                    {language === "hi" ? "काम पोस्ट करें →" : "Post a Job →"}
                  </Button>
                </Link>
                <Link href="/jobs" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold px-6 bg-white/10 hover:bg-white/20 text-white border-white/30">
                    {language === "hi" ? "काम खोजें →" : "Find Work →"}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Popular Categories with Gradient Badges */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3 sm:gap-4">
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {categories.map((c, i) => {
              const count = platformStats.categoryCounts[c.key] || 0;
              return (
                <Link
                  key={i}
                  href={`/jobs?category=${encodeURIComponent(c.key)}`}
                  className={`p-3.5 sm:p-5 rounded-2xl border border-slate-200 bg-gradient-to-br ${c.bg} ${c.border} hover:shadow-md transition-all group`}
                >
                  <span className="text-2xl sm:text-3xl block mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                    {c.icon}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-brand-600 transition line-clamp-1 sm:line-clamp-none">
                    {c.name}
                  </h4>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 block">
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
        <section className="py-16 bg-slate-50 border-b border-slate-200 w-full max-w-full overflow-hidden">
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
                        {job.budgetType === "PER_PAGE" || job.payType === "PER_PAGE" ? (
                          <>
                            ₹{job.pricePerUnit || 3}
                            <span className="text-xs font-semibold text-slate-600">/page</span>
                          </>
                        ) : (
                          <>
                            {formatCurrency(job.payAmount)}
                            <span className="text-xs font-normal text-slate-500">
                              /{job.payType?.toLowerCase()?.replace("_", " ")}
                            </span>
                          </>
                        )}
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
                      <Button size="sm" variant={user?.role === "EMPLOYER" ? "outline" : "primary"}>
                        {user?.role === "EMPLOYER"
                          ? (language === "hi" ? "विवरण देखें" : "View Details")
                          : (language === "hi" ? "आवेदन करें" : "Apply Now")}
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
      <section className="py-12 sm:py-20 bg-white border-b border-slate-200 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-600">
              Clear & Straightforward
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">How Work Adda Works</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              From finding a shift to getting paid into your UPI account.
            </p>

            <div className="mt-6 flex flex-col sm:inline-flex sm:flex-row w-full sm:w-auto max-w-sm sm:max-w-none mx-auto p-1 bg-slate-100 rounded-2xl border border-slate-200 gap-1 sm:gap-0">
              <button
                onClick={() => setActiveTab("worker")}
                className={`w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "worker"
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                For Job Seekers & Workers
              </button>
              <button
                onClick={() => setActiveTab("employer")}
                className={`w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
                  className="bg-slate-50 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-200 flex flex-col justify-between hover:border-brand-300 hover:shadow-md transition"
                >
                  <span className="text-xl sm:text-2xl font-black text-brand-600/40">{item.step}</span>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-2 sm:mt-3">{item.title}</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug sm:leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
                  className="bg-amber-50/50 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-amber-200 flex flex-col justify-between hover:shadow-md transition"
                >
                  <span className="text-xl sm:text-2xl font-black text-accent-600/40">{item.step}</span>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-2 sm:mt-3">{item.title}</h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-snug sm:leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Community Testimonials */}
      <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200 w-full max-w-full overflow-hidden">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-3">
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
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 text-center max-w-2xl mx-auto shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-7 h-7 text-brand-600" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-slate-900">
                  {language === "hi" ? "100% असली व सत्यापित समीक्षाएं" : "100% Authentic Community Ratings"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  {language === "hi"
                    ? "वर्क अड्डा पर केवल असली व्यापारियों और कामगारों द्वारा पूरे किए गए अनुबंधों की समीक्षाएं दिखाई जाती हैं। कोई भी फर्जी या बनावटी समीक्षा नहीं।"
                    : "Work Adda strictly displays authentic ratings and reviews from real employers and workers upon completing verified local tasks."}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link href="/employer/jobs/new">
                  <Button size="sm" variant="accent" className="font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-500">
                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                    {language === "hi" ? "नया काम पोस्ट करें" : "Post a Job / Task"}
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button size="sm" variant="outline" className="font-bold text-xs border-slate-300">
                    <Search className="w-3.5 h-3.5 mr-1 text-slate-600" />
                    {language === "hi" ? "उपलब्ध काम खोजें" : "Explore Open Gigs"}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. High-Impact Call To Action with Animated Aurora Cosmic Waves (Only shown for guest visitors) */}
      {!user && (
        <AnimatedAurora className="py-16 sm:py-28 border-t border-slate-800/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-5 sm:space-y-6">
            <Badge variant="brand" className="bg-white/10 text-white border-white/20 backdrop-blur-md">
              Join the Local Movement
            </Badge>
            <h2 className="text-2xl sm:text-5xl font-black tracking-tight leading-tight">
              Your next opportunity could be <br className="hidden sm:block" /> just around the corner.
            </h2>
            <p className="text-xs sm:text-base text-brand-100/90 max-w-xl mx-auto leading-relaxed">
              Start earning, hiring, and growing together with your local community on Work Adda.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 max-w-xs sm:max-w-none mx-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="accent" className="w-full sm:w-auto font-bold px-8 shadow-xl shadow-accent-500/30 hover:scale-105 transition-transform">
                  Join Work Adda for Free <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/jobs" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/5 backdrop-blur-md text-white border-white/30 hover:bg-white/15 px-8">
                  Explore All Jobs
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedAurora>
      )}
    </div>
  );
}
