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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatDistance } from "@/lib/location";
import { useLanguage } from "@/context/language-context";

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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Application Failed", data.error || "Unable to apply");
      } else {
        toast.success("Applied Successfully! 🎉", "Employer has received your profile.");
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

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> {language === "hi" ? "वापस काम खोजें" : "Back to Job Marketplace"}
        </Link>

        {/* Main Job Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="brand">{job.category}</Badge>
                <Badge variant="outline">{job.jobType.replace("_", " ")}</Badge>
                {job.matchScore !== null && (
                  <Badge variant="success" className="font-bold">
                    <Sparkles className="w-3 h-3 text-accent-500 mr-1" />
                    {job.matchScore}% {language === "hi" ? "मिलान" : "Match"}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {job.title}
              </h1>

              {/* Employer Info Strip */}
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-slate-900">{job.employer?.businessName}</span>
                {job.employer?.verificationStatus === "VERIFIED" && (
                  <span title="Verified Business">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </span>
                )}
                {job.employer?.rating > 0 && (
                  <span className="text-amber-500 font-bold text-xs">
                    ★ {job.employer.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Compensation Card */}
            <div className="sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0">
              <p className="text-2xl font-black text-brand-700">
                {formatCurrency(job.payAmount)}
              </p>
              <p className="text-xs text-slate-500 lowercase font-medium">
                {language === "hi"
                  ? (job.payType === "DAILY" ? "प्रति दिन" : job.payType === "MONTHLY" ? "प्रति माह" : `प्रति ${job.payType}`)
                  : `per ${job.payType}`}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {job.workersRequired} {language === "hi" ? "पद रिक्त" : (job.workersRequired === 1 ? "opening" : "openings")}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">
                {language === "hi" ? "स्थान" : "Location"}
              </span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                {job.location}
              </span>
              {job.distanceKm !== null && (
                <span className="text-[11px] text-brand-700 font-semibold block">
                  {formatDistance(job.distanceKm)}
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block font-medium">
                {language === "hi" ? "आरंभ तिथि" : "Start Date"}
              </span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(job.startDate || job.createdAt)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">
                {language === "hi" ? "आवेदक" : "Applicants"}
              </span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {job.applicantsCount} {language === "hi" ? "आवेदन आए" : "Applied"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">
                {language === "hi" ? "स्थिति" : "Status"}
              </span>
              <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {language === "hi" && job.status === "OPEN" ? "सक्रिय / खुला" : job.status}
              </span>
            </div>
          </div>

          {/* Transparent Match Reasons for Worker */}
          {job.matchReasons && job.matchReasons.length > 0 && (
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-xs space-y-2">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent-500" />
                {language === "hi"
                  ? `आपकी प्रोफाइल से मिलान कारण (${job.matchScore}% स्कोर):`
                  : `Why this matches your profile (${job.matchScore}% Score):`}
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-800">
                {job.matchReasons.map((r: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Job Description */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {language === "hi" ? "काम का विवरण" : "About the Work"}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Required Skills */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {language === "hi" ? "आवश्यक हुनर व योग्यताएं" : "Required Skills & Attributes"}
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

          {/* Employer Verification Profile Box */}
          <div className="p-5 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  {language === "hi" ? "नियोक्ता द्वारा पोस्ट" : "Posted by Employer"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {language === "hi" ? "ओटीपी-सत्यापित संपर्क" : "OTP-Verified Contact"}
                </span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900">{job.employer?.businessName}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{job.employer?.businessType} • {job.employer?.location}</p>
            </div>

            {user?.role === "WORKER" && (
              <Button size="sm" variant="secondary" onClick={startChatWithEmployer}>
                <MessageSquare className="w-4 h-4 mr-1.5" /> {language === "hi" ? "मैसेज करें" : "Message Employer"}
              </Button>
            )}
          </div>

          {/* Action CTA Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 transition"
            >
              <Flag className="w-3.5 h-3.5" /> {language === "hi" ? "संदिग्ध काम की रिपोर्ट करें" : "Report suspicious job"}
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {userApplication ? (
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    {language === "hi" ? `आवेदन जमा हो गया (${userApplication.status})` : `Application Submitted (${userApplication.status})`}
                  </div>
                  {userApplication.status === "ACCEPTED" && (
                    <Link href="/worker/work">
                      <Button size="sm" variant="primary">
                        {language === "hi" ? "सक्रिय काम अनुबंध देखें" : "View Active Work Contract"}
                      </Button>
                    </Link>
                  )}
                </div>
              ) : user?.role === "EMPLOYER" ? (
                <span className="text-xs text-slate-400 italic">
                  {language === "hi" ? "नियोक्ता नौकरियों के लिए आवेदन नहीं कर सकते।" : "Employers cannot apply for jobs."}
                </span>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="w-full sm:w-auto font-bold px-8 shadow-md shadow-brand-500/20"
                >
                  {language === "hi" ? "आवेदन करें" : "Apply Now"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title={`Apply for ${job.title}`}
          description="Send your application pitch directly to the employer."
        >
          <form onSubmit={handleApply} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Cover Message / Pitch
              </label>
              <textarea
                rows={4}
                required
                value={coverMessage}
                onChange={(e) => setCoverMessage(e.target.value)}
                placeholder="Share your relevant experience, distance from work location, and immediate availability..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Proposed Compensation (₹ / {job.payType})
              </label>
              <input
                type="number"
                value={proposedPay}
                onChange={(e) => setProposedPay(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder={`Default: ₹${job.payAmount}`}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Standard compensation is {formatCurrency(job.payAmount)}/{job.payType}. You may adjust if needed.
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setIsApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={submittingApply} className="font-bold">
                Submit Application
              </Button>
            </div>
          </form>
        </Modal>

        {/* Report Modal */}
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          title="Report this Job Listing"
          description="Help keep the Work Adda community safe and reliable."
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
