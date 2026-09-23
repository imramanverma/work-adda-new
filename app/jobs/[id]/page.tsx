"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import {
  MapPin,
  Building2,
  Calendar,
  Clock,
  IndianRupee,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  AlertTriangle,
  Flag,
  Globe,
  BookOpen,
  FileText,
  AlertCircle,
  ExternalLink,
  Layers,
  GraduationCap,
  User,
  Plus,
  X,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatDistance } from "@/lib/location";
import { useLanguage } from "@/context/language-context";
import { ACADEMIC_INTEGRITY_NOTICE } from "@/lib/constants/categories";

export default function JobDetailsPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const toast = useToast();

  const [job, setJob] = useState<any | null>(null);
  const [userApplication, setUserApplication] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverMessage, setCoverMessage] = useState("");
  const [proposedPay, setProposedPay] = useState<number | "">("");
  const [completionTime, setCompletionTime] = useState("Within 24 Hours");
  const [relevantSkills, setRelevantSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [sampleWorkUrl, setSampleWorkUrl] = useState("");
  const [sampleWorkUrls, setSampleWorkUrls] = useState<string[]>([]);
  const [submittingApply, setSubmittingApply] = useState(false);

  // Report Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Suspicious Contact Details");
  const [reportDesc, setReportDesc] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchJobDetails = async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data.job);
        setUserApplication(data.userApplication);
        if (data.job?.payAmount) {
          setProposedPay(data.job.payAmount);
        }
      } else {
        toast.error("Error", "Could not find this job listing");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const addSkillToApplication = () => {
    if (newSkill.trim() && !relevantSkills.includes(newSkill.trim())) {
      setRelevantSkills([...relevantSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkillFromApplication = (sk: string) => {
    setRelevantSkills(relevantSkills.filter((s) => s !== sk));
  };

  const addSampleUrl = () => {
    if (sampleWorkUrl.trim() && !sampleWorkUrls.includes(sampleWorkUrl.trim())) {
      setSampleWorkUrls([...sampleWorkUrls, sampleWorkUrl.trim()]);
      setSampleWorkUrl("");
    }
  };

  const removeSampleUrl = (url: string) => {
    setSampleWorkUrls(sampleWorkUrls.filter((u) => u !== url));
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/jobs/${id}`);
      return;
    }

    setSubmittingApply(true);
    try {
      const res = await fetch(`/api/jobs/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverMessage,
          proposedPay: proposedPay === "" ? undefined : Number(proposedPay),
          completionTime,
          relevantSkills,
          sampleWorkUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Application Failed", data.error || "Unable to apply");
      } else {
        toast.success("Application Submitted! 🎉", "Employer has received your proposal.");
        setIsApplyModalOpen(false);
        setUserApplication(data.application);
      }
    } catch (err: any) {
      toast.error("Network Error", err.message);
    } finally {
      setSubmittingApply(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: id,
          reportedUserId: job?.employer?.user?.id,
          reason: reportReason,
          description: reportDesc,
        }),
      });

      if (res.ok) {
        toast.success("Report Submitted", "Our safety moderation team will investigate this job listing.");
        setIsReportModalOpen(false);
      } else {
        const data = await res.json();
        toast.error("Error", data.error || "Could not file report");
      }
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setSubmittingReport(false);
    }
  };

  const startChatWithEmployer = async () => {
    if (!user) {
      router.push(`/login?redirect=/jobs/${id}`);
      return;
    }

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: id,
          workerId: user.id,
          employerId: job.employer.user.id,
        }),
      });
      if (res.ok) {
        router.push("/worker/messages");
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-96 bg-white rounded-3xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <p className="text-slate-500 mb-4">Job listing not found or has been closed.</p>
        <Link href="/jobs">
          <Button variant="outline">Browse other jobs</Button>
        </Link>
      </div>
    );
  }

  const isAssignment =
    job.category === "Academic & Assignment Work" ||
    job.category === "Assignment & Academic Work" ||
    job.budgetType === "PER_PAGE" ||
    !!job.categoryDetails?.subject;

  const isOwner = user?.id === job.employer?.user?.id;
  const canApply = (user?.role === "WORKER" || user?.role === "BOTH") && !isOwner;

  // Schema.org JobPosting Structured Data for Google Search & Google for Jobs
  const jobPostingJsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: "Work Adda",
      value: job.id,
    },
    datePosted: job.createdAt,
    validThrough: job.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType:
      job.jobType === "FULL_TIME"
        ? "FULL_TIME"
        : job.jobType === "PART_TIME"
        ? "PART_TIME"
        : "CONTRACTOR",
    hiringOrganization: {
      "@type": "Organization",
      name: job.employer?.businessName || "Work Adda Verified Hirer",
      sameAs: "https://work-adda-new.vercel.app",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressRegion: "Haryana",
        addressCountry: "IN",
      },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "INR",
      value: {
        "@type": "QuantitativeValue",
        value: job.payAmount,
        unitText:
          job.payType === "HOURLY"
            ? "HOUR"
            : job.payType === "DAILY"
            ? "DAY"
            : job.payType === "MONTHLY"
            ? "MONTH"
            : "TOTAL",
      },
    },
    jobLocationType: job.isRemote ? "TELECOMMUTE" : undefined,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Schema.org JobPosting JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
      />
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> {language === "hi" ? "वापस काम खोजें" : "Back to Marketplace"}
        </Link>

        {job.status === "COMPLETED" && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 text-blue-900">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">
                {language === "hi" ? "यह कार्य पूरा हो चुका है" : "This Work Has Been Completed"}
              </h4>
              <p className="text-xs text-blue-700 mt-0.5">
                The hirer has verified completion and released escrow payment. This job listing is closed.
              </p>
            </div>
          </div>
        )}

        {/* Main Job Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand">{job.category}</Badge>
                {job.subcategory && (
                  <Badge variant="outline" className="text-slate-700">
                    {job.subcategory}
                  </Badge>
                )}
                {job.isRemote && (
                  <Badge variant="outline" className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold">
                    🌐 Remote / Online
                  </Badge>
                )}
                {job.urgency === "VERY_URGENT" && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase">
                    🔥 Within 24h
                  </span>
                )}
                {job.urgency === "URGENT" && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                    ⚡ Urgent
                  </span>
                )}
                <Badge variant={job.status === "OPEN" ? "outline" : "default"}>
                  {job.status}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {job.title}
              </h1>

              {/* Employer / Poster Info Strip */}
              <div className="flex items-center gap-2 text-sm text-slate-600">
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

                <span className="font-bold text-slate-900">
                  {job.employer?.businessName || "Verified Hirer"}
                </span>

                {job.employer?.posterType && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                    {job.employer.posterType.replace("_", " ")}
                  </span>
                )}

                {job.employer?.verificationStatus === "VERIFIED" && (
                  <span title="Verified Account">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </span>
                )}
              </div>
            </div>

            {/* Compensation Card */}
            <div className="sm:text-right bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shrink-0">
              {job.budgetType === "PER_PAGE" || job.payType === "PER_PAGE" ? (
                <>
                  <p className="text-2xl font-black text-emerald-700">
                    ₹{job.pricePerUnit || 3}
                    <span className="text-sm font-semibold text-emerald-800"> / page</span>
                  </p>
                  <p className="text-xs text-emerald-900 font-bold mt-0.5">
                    Total Escrow: {formatCurrency(job.payAmount)}
                  </p>
                  {job.quantity && (
                    <p className="text-[11px] text-emerald-800 mt-0.5 font-medium">
                      {job.quantity} {job.unitType || "pages"} required
                    </p>
                  )}
                  {job.categoryDetails?.addons && job.categoryDetails.addons.length > 0 && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200">
                      +{job.categoryDetails.addons.length} Addon{job.categoryDetails.addons.length > 1 ? "s" : ""} (+₹{job.categoryDetails.addons.reduce((acc: number, a: any) => acc + Number(a.amount || 0), 0)})
                    </span>
                  )}
                </>
              ) : (
                <>
                  <p className="text-2xl font-black text-emerald-700">
                    {formatCurrency(job.payAmount)}
                  </p>
                  <p className="text-xs text-emerald-900 font-bold">
                    per {job.payType.toLowerCase().replace("_", " ")}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Location</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                {job.location}
              </span>
              {job.distanceKm !== null && !job.isRemote && (
                <span className="text-[11px] text-brand-700 font-semibold block">
                  {formatDistance(job.distanceKm)}
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Timeline / Start</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(job.startDate || job.createdAt)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Applicants</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {job.applicantsCount} applied
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Revisions Allowed</span>
              <span className="font-bold text-brand-700 flex items-center gap-1 mt-0.5">
                <FileCheck className="w-3.5 h-3.5 text-brand-600" />
                {job.revisionsAllowed ?? 2} Revisions Included
              </span>
            </div>
          </div>

          {/* Academic & Assignment Specifications Box */}
          {isAssignment && (
            <div className="p-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 rounded-2xl border border-blue-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
                <h3 className="font-black text-sm text-blue-950 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" /> Assignment & Academic Specifications
                </h3>
                <span className="text-[11px] font-bold text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                  Escrow Protected Task
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {job.categoryDetails?.subject && (
                  <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Subject</span>
                    <span className="font-bold text-slate-900 mt-0.5 block truncate">
                      {job.categoryDetails.subject}
                    </span>
                  </div>
                )}

                {job.categoryDetails?.academicLevel && (
                  <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Academic Level</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {job.categoryDetails.academicLevel}
                    </span>
                  </div>
                )}

                {job.categoryDetails?.assignmentFormat && (
                  <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Format</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      ✍️ {job.categoryDetails.assignmentFormat}
                    </span>
                  </div>
                )}

                {job.quantity && (
                  <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Volume</span>
                    <span className="font-black text-blue-900 mt-0.5 block">
                      📄 {job.quantity} Pages ({job.pricePerUnit ? `₹${job.pricePerUnit}/page` : "Budgeted"})
                    </span>
                  </div>
                )}

                {job.categoryDetails?.paperType && (
                  <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Paper Requirement</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {job.categoryDetails.paperType}
                    </span>
                  </div>
                )}

                {job.categoryDetails?.inkColor && (
                  <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Ink Colors</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {job.categoryDetails.inkColor}
                    </span>
                  </div>
                )}

                {job.deliveryMethod && (
                  <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Delivery Method</span>
                    <span className="font-bold text-slate-900 mt-0.5 block truncate">
                      {job.deliveryMethod.replace("_", " ")}
                    </span>
                  </div>
                )}

                {job.categoryDetails?.diagramsRequired !== undefined && (
                  <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Diagrams</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {job.categoryDetails.diagramsRequired ? "Yes (Required)" : "Not Required"}
                    </span>
                  </div>
                )}
              </div>

              {/* Reference Links */}
              {job.attachmentUrls && job.attachmentUrls.length > 0 && (
                <div className="pt-2 border-t border-blue-200/50">
                  <span className="text-[11px] font-bold text-blue-950 block mb-1.5">
                    Reference Files & Question Paper Links:
                  </span>
                  <div className="space-y-1.5">
                    {job.attachmentUrls.map((url: string, i: number) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition mr-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Reference Document #{i + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Money Addons Breakdown */}
              {job.categoryDetails?.addons && job.categoryDetails.addons.length > 0 && (
                <div className="pt-2 border-t border-blue-200/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Included Money Addons & Extras:
                    </span>
                    <span className="text-xs font-black text-emerald-700 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      +₹{job.categoryDetails.addons.reduce((acc: number, a: any) => acc + Number(a.amount || 0), 0)} Total Addons
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {job.categoryDetails.addons.map((addon: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-white/90 rounded-xl border border-blue-100 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 block">{addon.title}</span>
                            {addon.description && (
                              <span className="text-[10px] text-slate-500 block leading-tight">{addon.description}</span>
                            )}
                          </div>
                        </div>
                        <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 shrink-0">
                          +₹{addon.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Handover & Delivery Location Card */}
              {job.categoryDetails?.deliveryAddress && (
                <div className="pt-2 border-t border-blue-200/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Handover & Submission Location:
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Physical Handover
                    </span>
                  </div>
                  <div className="p-3 bg-white/90 rounded-xl border border-blue-100 text-xs space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {job.categoryDetails.deliveryAddress.collegeOrCampus && (
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">College / Campus</span>
                          <span className="font-bold text-slate-900">{job.categoryDetails.deliveryAddress.collegeOrCampus}</span>
                        </div>
                      )}
                      {job.categoryDetails.deliveryAddress.addressLine && (
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Hostel / Address</span>
                          <span className="font-bold text-slate-900">{job.categoryDetails.deliveryAddress.addressLine}</span>
                        </div>
                      )}
                      {job.categoryDetails.deliveryAddress.landmark && (
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Landmark</span>
                          <span className="font-semibold text-slate-700">{job.categoryDetails.deliveryAddress.landmark}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">City & Pincode</span>
                        <span className="font-semibold text-slate-700">
                          {job.categoryDetails.deliveryAddress.city || "Fatehabad"}
                          {job.categoryDetails.deliveryAddress.pincode ? ` - ${job.categoryDetails.deliveryAddress.pincode}` : ""}
                        </span>
                      </div>
                    </div>
                    {job.categoryDetails.deliveryAddress.handoverInstructions && (
                      <div className="p-2 bg-blue-50/70 rounded-lg text-[11px] text-blue-900 font-medium">
                        <strong>Instructions:</strong> {job.categoryDetails.deliveryAddress.handoverInstructions}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Academic Integrity Callout */}
              <div className="p-3 bg-blue-100/60 rounded-xl border border-blue-200/80 text-[11px] text-blue-950 flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <strong>WorkAdda Policy Note:</strong> {ACADEMIC_INTEGRITY_NOTICE}
                </div>
              </div>
            </div>
          )}

          {/* Job Description */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {language === "hi" ? "काम का विवरण" : "About the Work & Task Instructions"}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Required Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {language === "hi" ? "आवश्यक हुनर व योग्यताएं" : "Required Skills & Capabilities"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Employer / Hirer Box */}
          <div className="p-5 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              {job.employer?.shopImage ? (
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={job.employer.shopImage}
                    alt={job.employer.businessName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                    Posted By Hirer
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Contact
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">{job.employer?.businessName}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {job.employer?.posterType || "Local Business"} • {job.employer?.location}
                </p>
              </div>
            </div>

            {(user?.role === "WORKER" || user?.role === "BOTH") && !isOwner && (
              <Button size="sm" variant="secondary" onClick={startChatWithEmployer}>
                <MessageSquare className="w-4 h-4 mr-1.5" /> Message Hirer
              </Button>
            )}
          </div>

          {/* Action CTA Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 transition"
            >
              <Flag className="w-3.5 h-3.5" /> Report suspicious listing
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {userApplication ? (
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    Application Submitted ({userApplication.status})
                  </div>
                  {userApplication.status === "ACCEPTED" && (
                    <Link href="/worker/work">
                      <Button size="sm" variant="primary">
                        View Active Work Contract
                      </Button>
                    </Link>
                  )}
                </div>
              ) : isOwner ? (
                <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold">
                  You posted this work listing.
                </div>
              ) : user?.role === "EMPLOYER" ? (
                <span className="text-xs text-slate-400 italic">
                  Employer accounts cannot apply. Switch to Worker or Both.
                </span>
              ) : job.status !== "OPEN" ? (
                <div className="px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold">
                  Listing Closed ({job.status})
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="w-full sm:w-auto font-bold px-8 shadow-md shadow-brand-500/20"
                >
                  Apply & Submit Proposal 🚀
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Application Proposal Modal */}
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title={`Apply for ${job.title}`}
          description="Submit your proposal, timeframe, and work samples directly to the hirer."
        >
          <form onSubmit={handleApply} className="space-y-4 text-left">
            {/* Task Budget Breakdown Banner */}
            {isAssignment && (
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-xs space-y-1">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Base Writing:</span>
                  <span>
                    {job.quantity || 40} pages × ₹{job.pricePerUnit || 3}/page = ₹{(Number(job.quantity) || 40) * (Number(job.pricePerUnit) || 3)}
                  </span>
                </div>
                {job.categoryDetails?.addons && job.categoryDetails.addons.length > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>
                      Addons ({job.categoryDetails.addons.map((a: any) => a.title).join(", ")}):
                    </span>
                    <span>
                      +₹{job.categoryDetails.addons.reduce((acc: number, a: any) => acc + Number(a.amount || 0), 0)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-black text-emerald-950 border-t border-emerald-200/60 pt-1 text-sm">
                  <span>Total Escrow Allocation:</span>
                  <span>{formatCurrency(job.payAmount)}</span>
                </div>
              </div>
            )}

            {/* Proposed Pay & Completion Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proposed Compensation (₹)
                </label>
                <input
                  type="number"
                  required
                  value={proposedPay}
                  onChange={(e) => setProposedPay(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder={`Default: ₹${job.payAmount}`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-emerald-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Original listing budget: {formatCurrency(job.payAmount)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Completion Time
                </label>
                <select
                  value={completionTime}
                  onChange={(e) => setCompletionTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="Within 12 Hours (Same Day)">Within 12 Hours (Same Day)</option>
                  <option value="Within 24 Hours">Within 24 Hours</option>
                  <option value="Within 48 Hours (2 Days)">Within 48 Hours (2 Days)</option>
                  <option value="Within 3 Days">Within 3 Days</option>
                  <option value="Within 1 Week">Within 1 Week</option>
                </select>
              </div>
            </div>

            {/* Proposal Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Proposal & Pitch Note
              </label>
              <textarea
                rows={4}
                required
                value={coverMessage}
                onChange={(e) => setCoverMessage(e.target.value)}
                placeholder="Explain why you are the right fit, your background in this subject/task, and how quickly you can start..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Relevant Skills Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Relevant Skills for this Task
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-[32px] p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                {relevantSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-md text-xs font-semibold"
                  >
                    {sk}
                    <button type="button" onClick={() => removeSkillFromApplication(sk)}>
                      <X className="w-3 h-3 hover:text-red-600" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Neat Handwriting, DBMS, Fast Writing, Good English..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkillToApplication();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addSkillToApplication}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>
            </div>

            {/* Work Sample / Portfolio Link */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sample Work / Handwriting Photos / Portfolio Link (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Google Drive, Dropbox, or Portfolio URL..."
                  value={sampleWorkUrl}
                  onChange={(e) => setSampleWorkUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addSampleUrl}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Link
                </Button>
              </div>
              {sampleWorkUrls.length > 0 && (
                <div className="mt-2 space-y-1">
                  {sampleWorkUrls.map((u, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="truncate text-blue-600 max-w-[85%]">{u}</span>
                      <button type="button" onClick={() => removeSampleUrl(u)} className="text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setIsApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={submittingApply} className="font-bold px-6">
                Send Proposal
              </Button>
            </div>
          </form>
        </Modal>

        {/* Report Modal */}
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          title="Report this Job Listing"
          description="Help keep the WorkAdda community safe and reliable."
        >
          <form onSubmit={handleReport} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="Fraudulent Job">Fraudulent or Fake Job</option>
                <option value="Suspicious Contact Details">Suspicious Contact Details</option>
                <option value="Payment Issue">Advance Fee Demanded</option>
                <option value="Inappropriate Content">Inappropriate Content</option>
                <option value="Other">Other Policy Violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Details</label>
              <textarea
                rows={3}
                required
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                placeholder="Explain what was wrong with this listing..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setIsReportModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" isLoading={submittingReport}>
                Submit Report
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
