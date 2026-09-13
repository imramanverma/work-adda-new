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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatDistance } from "@/lib/location";
import { useLanguage } from "@/context/language-context";

export default function JobsDiscoveryPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [maxDistance, setMaxDistance] = useState<string>("any"); // "2", "5", "10", "25", "any"
  const [sortBy, setSortBy] = useState("recently_posted"); // "recently_posted", "highest_pay", "nearest", "relevance"
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  const [activeMatchReasonModal, setActiveMatchReasonModal] = useState<any | null>(null);

  const categories = [
    "All",
    "Delivery",
    "Retail",
    "Logistics",
    "Hospitality",
    "Events",
    "Office Assistance",
    "Data Entry",
    "Sales",
    "Marketing",
    "IT & Technology",
    "Repair & Maintenance",
    "Construction",
    "General Labour",
  ];

  const jobTypes = [
    "All",
    "FULL_TIME",
    "PART_TIME",
    "GIG",
    "TEMPORARY",
    "FLEXIBLE",
    "INTERNSHIP",
  ];

  const categoryTranslations: Record<string, string> = {
    "All": "सभी काम",
    "Delivery": "डिलीवरी",
    "Retail": "दुकान व रीटेल",
    "Logistics": "लॉजिस्टिक्स",
    "Hospitality": "हॉस्पिटैलिटी",
    "Events": "इवेंट व कैटरिंग",
    "Office Assistance": "कार्यालय सहायता",
    "Data Entry": "डेटा एंट्री",
    "Sales": "सेल्स व काउंटर",
    "Marketing": "मार्केटिंग",
    "IT & Technology": "आईटी व टेक",
    "Repair & Maintenance": "मरम्मत व मेंटेनेंस",
    "Construction": "निर्माण",
    "General Labour": "सामान्य मजदूरी",
  };

  const skillTranslations: Record<string, string> = {
    "Two-Wheeler Driving": "टू-व्हीलर ड्राइविंग",
    "Order Packing": "ऑर्डर पैकिंग",
    "Inventory Stocking": "इन्वेंट्री स्टॉकिंग",
    "Forklift Handling": "फोर्कलिफ्ट संचालन",
    "Route Navigation": "रूट नेविगेशन",
    "Counter Sales": "काउंटर सेल्स",
    "Billing & Cashiering": "बिलिंग व कैशियर",
    "Customer Service": "ग्राहक सेवा",
    "Store Display Setup": "स्टोर डिस्प्ले सेटअप",
    "Telecalling & Leads": "टेलीकॉल्लिंग",
    "Event Setup & Ushering": "इवेंट सेटअप व स्वागत",
    "Food Serving": "फूड सर्विंग",
    "Kitchen Assistance": "किचन सहायता",
    "Barista Skills": "बरिस्ता स्किल्स",
    "Catering Support": "कैटरिंग सहायता",
    "Data Entry & Excel": "डेटा एंट्री व एक्सेल",
    "Basic Receptionist": "रिसेप्शनिस्ट",
    "Social Media Posting": "सोशल मीडिया",
    "Graphic Design (Canva)": "ग्राफिक डिजाइनिंग",
    "Computer Troubleshooting": "कंप्यूटर रिपेयर",
    "Residential Wiring": "वायरिंग व बिजली",
    "Plumbing & Pipe Repair": "प्लंबिंग काम",
    "Appliance Repair": "उपकरण मरम्मत",
    "Carpentry & Furniture Assembly": "बढ़ई व फर्नीचर",
    "Painting & Wall Finish": "पेंटिंग व पुट्टी",
    "General Physical Labour": "सामान्य शारीरिक काम",
  };

  const formatPayType = (payType: string) => {
    if (language !== "hi") return `/${payType.toLowerCase()}`;
    switch (payType.toUpperCase()) {
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
      case "GIG": return "गिग";
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
      if (selectedJobType && selectedJobType !== "All") params.set("jobType", selectedJobType);
      if (selectedLocation) params.set("location", selectedLocation);
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
  }, [searchQuery, selectedCategory, selectedJobType, selectedLocation, maxDistance, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t("jobs.title")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t("jobs.subtitle")}
            </p>
          </div>

          {/* Location Badge Indicator */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs w-fit">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>{t("jobs.browsing_near")} <strong>{user.location || "Fatehabad & Sirsa"}</strong></span>
            </div>
          )}
        </div>

        {/* Search & Main Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={t("jobs.filter_input")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* City / Area Filter */}
            <div className="sm:col-span-3 space-y-1.5">
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={t("jobs.district_filter")}
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold">{t("jobs.districts_label")}</span>
                {["Fatehabad", "Sirsa"].map((district) => (
                  <button
                    key={district}
                    type="button"
                    onClick={() => setSelectedLocation(selectedLocation === district ? "" : district)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                      selectedLocation.toLowerCase() === district.toLowerCase()
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {district}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="recently_posted">{t("jobs.sort_recent")}</option>
                <option value="nearest">{t("jobs.sort_nearest")}</option>
                <option value="highest_pay">{t("jobs.sort_pay")}</option>
                {user?.role === "WORKER" && (
                  <option value="relevance">
                    {language === "hi" ? "क्रम: सर्वश्रेष्ठ मिलान स्कोर" : "Sort: Highest Match Score"}
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Quick Distance Radius Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" /> {t("jobs.radius_label")}
              </span>
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                {[
                  { label: t("jobs.within_2km"), val: "2" },
                  { label: t("jobs.within_5km"), val: "5" },
                  { label: t("jobs.within_10km"), val: "10" },
                  { label: t("jobs.within_25km"), val: "25" },
                  { label: t("jobs.any_distance"), val: "any" },
                ].map((d) => (
                  <button
                    key={d.val}
                    onClick={() => setMaxDistance(d.val)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
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

            {/* Clear Filters Button */}
            {(searchQuery || selectedCategory !== "All" || selectedJobType !== "All" || selectedLocation || maxDistance !== "any") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedJobType("All");
                  setSelectedLocation("");
                  setMaxDistance("any");
                  setSortBy("recently_posted");
                }}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> {language === "hi" ? "फ़िल्टर हटाएं" : "Reset Filters"}
              </button>
            )}
          </div>

          {/* Category Horizontal Scroll Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {language === "hi" ? (categoryTranslations[cat] || cat) : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            {language === "hi" ? (
              <>
                <strong>{jobs.length}</strong> {jobs.length === 1 ? "अवसर दिखाया जा रहा है" : "अवसर दिखाए जा रहे हैं"}
              </>
            ) : (
              <>
                Showing <strong>{jobs.length}</strong> {jobs.length === 1 ? "opportunity" : "opportunities"}
              </>
            )}
          </span>
          {user?.role === "WORKER" && (
            <span className="flex items-center gap-1 text-brand-700 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-accent-500" />
              {language === "hi"
                ? "आपकी प्रोफाइल के अनुसार स्मार्ट मिलान स्कोर"
                : "Smart match scores customized to your profile"}
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
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {language === "hi" ? "आस-पास कोई काम नहीं मिला" : "No work found nearby"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === "hi"
                ? "अधिक काम देखने के लिए अपनी खोज का दायरा बढ़ाएं या कोई अन्य श्रेणी चुनें।"
                : "Try increasing your search radius or selecting another category to see more listings."}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4"
              onClick={() => {
                setMaxDistance("any");
                setSelectedCategory("All");
                setSearchQuery("");
              }}
            >
              {language === "hi" ? "दायरा रीसेट करें" : "Reset Search Radius"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Pay & Match Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-lg font-black text-slate-900">
                        {formatCurrency(job.payAmount)}
                      </span>
                      <span className="text-xs text-slate-500 lowercase"> {formatPayType(job.payType)}</span>
                    </div>

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
                        title={language === "hi" ? "मिलान विवरण देखने के लिए क्लिक करें" : "Click to view match explanation"}
                      >
                        <Sparkles className="w-3 h-3 text-accent-500" />
                        {job.matchScore}% {language === "hi" ? "मिलान" : "Match"}
                      </button>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        {formatJobType(job.jobType)}
                      </Badge>
                    )}
                  </div>

                  {/* Title & Employer */}
                  <Link href={`/jobs/${job.id}`}>
                    <h3 className="font-bold text-base text-slate-900 hover:text-brand-600 transition leading-snug line-clamp-2">
                      {job.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                    {job.employer?.shopImage ? (
                      <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-2xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={job.employer.shopImage}
                          alt={job.employer.businessName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-700 truncate">
                      {job.employer?.businessName || "Local Business"}
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
                    {job.distanceKm !== null && (
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
            ))}
          </div>
        )}

        {/* Modal: Transparent "Why" Match Breakdown */}
        {activeMatchReasonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent-500" />
                    {language === "hi"
                      ? `मिलान स्कोर: ${activeMatchReasonModal.matchScore}%`
                      : `Match Score: ${activeMatchReasonModal.matchScore}%`}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {language === "hi"
                      ? "यह काम आपके लिए क्यों अनुशंसित है"
                      : "Why this job is recommended for you"}
                  </p>
                </div>
                <button
                  onClick={() => setActiveMatchReasonModal(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-700">
                  {language === "hi" ? "एल्गोरिदम घटक विश्लेषण:" : "Algorithm breakdown components:"}
                </p>
                <ul className="space-y-2 text-xs text-slate-600">
                  {activeMatchReasonModal.matchReasons?.map((reason: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 text-[11px] text-slate-400">
                {language === "hi"
                  ? "फॉर्मूला: 40% हुनर + 20% दूरी + 15% उपलब्धता + 15% अनुभव + 10% प्रतिष्ठा।"
                  : "Formula: 40% Skills + 20% Distance + 15% Availability + 15% Experience + 10% Reputation."}
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setActiveMatchReasonModal(null)}
              >
                {language === "hi" ? "बंद करें" : "Close Breakdown"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
