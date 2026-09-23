"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  Clock,
  Sparkles,
  Building2,
  Calendar,
  IndianRupee,
  ChevronDown,
  Info,
  CheckCircle2,
  X,
  Globe,
  BookOpen,
  User,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatJobPay } from "@/lib/utils";
import { formatDistance } from "@/lib/location";
import { useLanguage } from "@/context/language-context";
import { WORKADDA_CATEGORIES } from "@/lib/constants/categories";

export default function JobsDiscoveryPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState<string>("any"); // "2", "5", "10", "25", "any"
  const [sortBy, setSortBy] = useState("recently_posted"); // "recently_posted", "highest_pay", "nearest", "relevance"
  const [activeMatchReasonModal, setActiveMatchReasonModal] = useState<any | null>(null);

  const categories = [
    { id: "All", name: "All Work", nameHi: "सभी काम", emoji: "⚡" },
    ...WORKADDA_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      nameHi: c.nameHi,
      emoji: c.emoji,
      subcategories: c.subcategories,
    })),
  ];

  const activeCategoryObj = WORKADDA_CATEGORIES.find((c) => c.id === selectedCategory);

  const jobTypes = [
    "All",
    "FULL_TIME",
    "PART_TIME",
    "GIG",
    "TEMPORARY",
    "FLEXIBLE",
    "INTERNSHIP",
  ];

  const skillTranslations: Record<string, string> = {
    "Two-Wheeler Driving": "टू-व्हीलर ड्राइविंग",
    "Order Packing": "ऑर्डर पैकिंग",
    "Inventory Stocking": "इन्वेंट्री स्टॉकिंग",
    "Counter Sales": "काउंटर सेल्स",
    "Billing & Cashiering": "बिलिंग व कैशियर",
    "Customer Service": "ग्राहक सेवा",
    "Data Entry & Excel": "डेटा एंट्री व एक्सेल",
    "Graphic Design": "ग्राफिक डिजाइन",
    "Neat Handwriting": "सुंदर लिखावट",
    "Fast Writing": "तेज लेखन",
    "Good English": "अच्छी अंग्रेजी",
    "Good Hindi": "अच्छी हिंदी",
    "DBMS": "डीबीएमएस",
    "Computer Science": "कंप्यूटर साइंस",
    "General Physical Labour": "सामान्य शारीरिक काम",
  };

  const formatPayType = (payType: string) => {
    if (language !== "hi") {
      if (payType === "PER_PAGE") return "/page";
      return `/${payType.toLowerCase()}`;
    }
    switch (payType.toUpperCase()) {
      case "PER_PAGE": return "/पेज";
      case "DAILY": return "/दैनिक";
      case "MONTHLY": return "/माह";
      case "HOURLY": return "/घंटा";
      case "WEEKLY": return "/सप्ताह";
      case "FIXED": return "/काम";
      default: return `/${payType.toLowerCase()}`;
    }
  };

  const formatJobType = (jobType: string) => {
    if (language !== "hi") return jobType.replace("_", " ");
    switch (jobType.toUpperCase()) {
      case "FULL_TIME": return "फुल टाइम";
      case "PART_TIME": return "पार्ट टाइम";
      case "GIG": return "गिग / टास्क";
      case "TEMPORARY": return "अस्थायी";
      case "FLEXIBLE": return "लचीला";
      case "INTERNSHIP": return "इंटर्नशिप";
      default: return jobType.replace("_", " ");
    }
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedCategory && selectedCategory !== "All") params.set("category", selectedCategory);
      if (selectedSubcategory && selectedSubcategory !== "All") params.set("subcategory", selectedSubcategory);
      if (selectedJobType && selectedJobType !== "All") params.set("jobType", selectedJobType);
      if (selectedLocation) params.set("location", selectedLocation);
      if (isRemoteOnly) params.set("isRemote", "true");
      if (maxDistance !== "any") params.set("maxDistance", maxDistance);
      params.set("sortBy", sortBy);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSubcategory, selectedJobType, selectedLocation, isRemoteOnly, maxDistance, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedSubcategory("All");
    setSelectedJobType("All");
    setSelectedLocation("");
    setIsRemoteOnly(false);
    setMaxDistance("any");
    setSortBy("recently_posted");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "All" ||
    selectedSubcategory !== "All" ||
    selectedJobType !== "All" ||
    selectedLocation ||
    isRemoteOnly ||
    maxDistance !== "any";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {language === "hi" ? "कार्य व अवसर खोजें" : "Explore Tasks & Work"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === "hi"
                ? "असाइनमेंट, टाइपिंग, दुकान, डिलीवरी, व तकनीकी कार्य — सीधे कामदाता से संपर्क करें।"
                : "Browse assignments, digital tasks, local store shifts, deliveries, and freelance gigs with Escrow protection."}
            </p>
          </div>

          {(user?.role === "EMPLOYER" || user?.role === "BOTH") && (
            <Link href="/employer/jobs/new">
              <Button size="sm" variant="accent" className="font-bold shadow-sm">
                + {language === "hi" ? "नया काम पोस्ट करें" : "Post a Job"}
              </Button>
            </Link>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          {/* Top Search Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                aria-label="Search jobs by title, subject, or skills"
                placeholder={
                  language === "hi"
                    ? "शीर्षक, विषय, या हुनर से खोजें (उदा. DBMS, असाइनमेंट, सेल्स, डिलीवरी)..."
                    : "Search by title, subject, skills (e.g. DBMS, Assignment Writing, Excel, Delivery)..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-3 relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                aria-label="Filter jobs by location or city"
                placeholder={language === "hi" ? "स्थान / शहर (उदा. Fatehabad, Sirsa, Hisar)" : "Location / City (Fatehabad, Sirsa, Hisar)..."}
                value={selectedLocation}
                disabled={isRemoteOnly}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  isRemoteOnly ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white"
                }`}
              />
            </div>

            <div className="sm:col-span-2">
              <select
                aria-label="Filter by job type"
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "All" ? (language === "hi" ? "सभी प्रकार" : "All Types") : formatJobType(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <select
                aria-label="Sort jobs by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <option value="recently_posted">{t("jobs.sort_recent")}</option>
                <option value="highest_pay">{t("jobs.sort_pay")}</option>
                <option value="nearest">{t("jobs.sort_nearest")}</option>
                {user?.role === "WORKER" && (
                  <option value="relevance">
                    {language === "hi" ? "क्रम: सर्वश्रेष्ठ मिलान" : "Sort: Match Score"}
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Quick Distance Radius & Remote Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Remote Toggle */}
              <button
                type="button"
                aria-pressed={isRemoteOnly}
                onClick={() => setIsRemoteOnly(!isRemoteOnly)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  isRemoteOnly
                    ? "bg-cyan-600 text-white border-cyan-600 shadow-xs"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === "hi" ? "केवल ऑनलाइन / रिमोट" : "Remote / Online Only"}</span>
              </button>

              {/* Distance radius (only if not remote only) */}
              {!isRemoteOnly && (
                <div className="flex items-center gap-1.5" role="group" aria-label="Distance Radius Filters">
                  <span className="font-bold text-slate-600 flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3 h-3 text-brand-600" /> {t("jobs.radius_label")}
                  </span>
                  <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                    {[
                      { label: "2km", val: "2" },
                      { label: "5km", val: "5" },
                      { label: "10km", val: "10" },
                      { label: "25km", val: "25" },
                      { label: "Any", val: "any" },
                    ].map((d) => (
                      <button
                        key={d.val}
                        aria-pressed={maxDistance === d.val}
                        onClick={() => setMaxDistance(d.val)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                          maxDistance === d.val
                            ? "bg-white shadow-xs text-brand-700 font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-lg px-1.5 py-0.5"
              >
                <X className="w-3.5 h-3.5" /> {language === "hi" ? "फ़िल्टर हटाएं" : "Reset Filters"}
              </button>
            )}
          </div>

          {/* Category Horizontal Scroll Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none" role="tablist" aria-label="Job Categories">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubcategory("All");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    isSelected
                      ? "bg-brand-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{language === "hi" ? cat.nameHi : cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Subcategory Secondary Pills if category selected */}
          {activeCategoryObj && activeCategoryObj.subcategories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 border-t border-slate-100 scrollbar-none">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">
                {language === "hi" ? "उप-श्रेणी:" : "Subtype:"}
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubcategory("All")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                  selectedSubcategory === "All"
                    ? "bg-brand-100 text-brand-800 font-bold border border-brand-200"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                All Subcategories
              </button>
              {activeCategoryObj.subcategories.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubcategory(sub.name)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                    selectedSubcategory === sub.name
                      ? "bg-brand-100 text-brand-800 font-bold border border-brand-200"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Count Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong>{jobs.length}</strong> {jobs.length === 1 ? "work opportunity" : "work opportunities"}
          </span>
          {user?.role === "WORKER" && (
            <span className="flex items-center gap-1 text-brand-700 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-accent-500" />
              Smart match active for your skills
            </span>
          )}
        </div>

        {/* Job Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse p-6 space-y-4" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {language === "hi" ? "कोई कार्य नहीं मिला" : "No listings found matching filters"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === "hi"
                ? "अधिक अवसर देखने के लिए अपने फ़िल्टर रीसेट करें या कोई अन्य श्रेणी चुनें।"
                : "Try resetting your search filters or exploring another category."}
            </p>
            <Button size="sm" variant="outline" className="mt-4" onClick={resetAllFilters}>
              {language === "hi" ? "सभी फ़िल्टर रीसेट करें" : "Reset All Filters"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => {
              const isAssignment =
                job.category === "Academic & Assignment Work" ||
                job.category === "Assignment & Academic Work" ||
                job.budgetType === "PER_PAGE";

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Bar: Pay & Match / Urgency Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        {job.budgetType === "PER_PAGE" || job.payType === "PER_PAGE" ? (
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-black text-slate-900">
                                ₹{job.pricePerUnit || 3}
                              </span>
                              <span className="text-xs font-semibold text-slate-600">
                                {language === "hi" ? "/पेज" : "/page"}
                              </span>
                            </div>
                            <span className="text-[11px] text-emerald-700 font-bold block">
                              Total {formatCurrency(job.payAmount || (job.pricePerUnit || 3) * (job.quantity || 40))}
                              {job.quantity ? ` (${job.quantity} pages)` : ""}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-black text-slate-900">
                                {formatCurrency(job.payAmount)}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatPayType(job.payType)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {job.urgency === "VERY_URGENT" && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider">
                            🔥 Within 24h
                          </span>
                        )}
                        {job.urgency === "URGENT" && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                            ⚡ Urgent
                          </span>
                        )}

                        {job.matchScore !== null && job.matchScore !== undefined ? (
                          <button
                            type="button"
                            onClick={() => setActiveMatchReasonModal(job)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition hover:scale-105 ${
                              job.matchScore >= 80
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : job.matchScore >= 60
                                ? "bg-blue-50 text-brand-800 border border-brand-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                            title="Click to view match breakdown"
                          >
                            <Sparkles className="w-3 h-3 text-accent-500" />
                            {job.matchScore}% Match
                          </button>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            {formatJobType(job.jobType)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <Link href={`/jobs/${job.id}`}>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition leading-snug line-clamp-2">
                        {job.title}
                      </h3>
                    </Link>

                    {/* Dynamic Task Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      {job.quantity && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/60 text-[10px] font-bold">
                          📄 {job.quantity} Pages
                        </span>
                      )}

                      {job.categoryDetails?.subject && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200/60 text-[10px] font-semibold truncate max-w-[150px]">
                          📚 {job.categoryDetails.subject}
                        </span>
                      )}

                      {job.categoryDetails?.assignmentFormat && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                          ✍️ {job.categoryDetails.assignmentFormat}
                        </span>
                      )}

                      {job.isRemote && (
                        <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200/60 text-[10px] font-bold">
                          🌐 Remote
                        </span>
                      )}

                      {job.categoryDetails?.addons && job.categoryDetails.addons.length > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/60 text-[10px] font-bold">
                          ✨ +{job.categoryDetails.addons.length} Addon{job.categoryDetails.addons.length > 1 ? "s" : ""} (+₹{job.categoryDetails.addons.reduce((acc: number, a: any) => acc + Number(a.amount || 0), 0)})
                        </span>
                      )}

                      {job.categoryDetails?.deliveryAddress?.collegeOrCampus && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[10px] font-semibold truncate max-w-[160px]">
                          📍 {job.categoryDetails.deliveryAddress.collegeOrCampus}
                        </span>
                      )}
                    </div>

                    {/* Employer / Poster Strip */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-3">
                      {job.employer?.shopImage ? (
                        <div className="w-6 h-6 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={job.employer.shopImage}
                            alt={job.employer.businessName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : job.employer?.posterType === "STUDENT" ? (
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-3.5 h-3.5" />
                        </div>
                      ) : job.employer?.posterType === "INDIVIDUAL" ? (
                        <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      )}

                      <span className="font-semibold text-slate-700 truncate">
                        {job.employer?.businessName || "Verified Hirer"}
                      </span>

                      {job.employer?.rating > 0 && (
                        <span className="text-amber-500 font-bold text-[11px]">
                          ★ {job.employer.rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Location & Distance */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="truncate">{job.location}</span>
                      {job.distanceKm !== null && !job.isRemote && (
                        <span className="font-bold text-brand-700 text-[11px] shrink-0">
                          • {formatDistance(job.distanceKm)}
                        </span>
                      )}
                    </div>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(job.requiredSkills || []).slice(0, 3).map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-600"
                        >
                          {language === "hi" ? (skillTranslations[skill] || skill) : skill}
                        </span>
                      ))}
                      {(job.requiredSkills || []).length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{job.requiredSkills.length - 3} {language === "hi" ? "और" : "more"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {job.applicantsCount}{" "}
                      {language === "hi"
                        ? "आवेदक"
                        : job.applicantsCount === 1
                        ? "applicant"
                        : "applicants"}
                    </span>
                    <Link href={`/jobs/${job.id}`}>
                      <Button size="sm" variant="primary" className="font-semibold">
                        {language === "hi" ? "देखें व आवेदन करें" : "View & Apply"}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Transparent Match Breakdown */}
        {activeMatchReasonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent-500" />
                    Match Score: {activeMatchReasonModal.matchScore}%
                  </h4>
                  <p className="text-xs text-slate-500">Why this opportunity is matched to your skills</p>
                </div>
                <button
                  onClick={() => setActiveMatchReasonModal(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-700">Algorithm Breakdown:</p>
                <ul className="space-y-2 text-xs text-slate-600">
                  {activeMatchReasonModal.matchReasons?.map((reason: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setActiveMatchReasonModal(null)}
              >
                Close Breakdown
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
