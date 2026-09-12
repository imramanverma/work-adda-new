"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  Users,
  Briefcase,
  Star,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Award,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

function ApplicantsContent() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId") || "";
  const toast = useToast();

  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterJobId, setFilterJobId] = useState(initialJobId);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplicants = async () => {
    try {
      const params = new URLSearchParams();
      if (filterJobId) params.set("jobId", filterJobId);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/applications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplicants(data.applications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [filterJobId, statusFilter]);

  const handleStatusUpdate = async (applicationId: string, status: "SHORTLISTED" | "ACCEPTED" | "REJECTED") => {
    setProcessingId(applicationId);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (res.ok) {
        if (status === "ACCEPTED") {
          toast.success("Worker Hired! 🎉", "Active work contract created. The worker has been notified.");
        } else if (status === "SHORTLISTED") {
          toast.info("Candidate Shortlisted ⭐", "Candidate marked as shortlisted.");
        } else {
          toast.info("Application Rejected", "Application updated.");
        }
        fetchApplicants();
      } else {
        toast.error("Error", data.error || "Failed to update status");
      }
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Applicant Review & Hiring Board
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Screen candidate ratings, past completed gigs, and hire qualified local workers with 1 click.
            </p>
          </div>

          <Link href="/employer/work">
            <Button size="sm" variant="outline">
              <Briefcase className="w-4 h-4 mr-1.5" /> View Active Contracts
            </Button>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["ALL", "PENDING", "SHORTLISTED", "ACCEPTED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                statusFilter === s
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Applicants Grid */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-white rounded-3xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : applicants.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-900">No applicants found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No workers currently match this filter criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-sm transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Worker Profile Details */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        app.status === "ACCEPTED"
                          ? "success"
                          : app.status === "SHORTLISTED"
                          ? "warning"
                          : app.status === "REJECTED"
                          ? "danger"
                          : "default"
                      }
                      className="font-bold"
                    >
                      {app.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Applied: {formatDate(app.appliedAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white font-black text-sm flex items-center justify-center">
                      {app.worker?.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-tight">
                        {app.worker?.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          {app.worker?.workerProfile?.rating > 0
                            ? app.worker.workerProfile.rating.toFixed(1)
                            : "5.0"}
                        </span>
                        <span>•</span>
                        <span>{app.worker?.workerProfile?.completedJobs || 0} tasks completed</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-brand-600" />
                          {app.worker?.location || "Local"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600">
                    Applied for:{" "}
                    <strong className="text-slate-900">{app.job?.title}</strong> (
                    {formatCurrency(app.proposedPay || app.job?.payAmount)})
                  </div>

                  {app.coverMessage && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                      "{app.coverMessage}"
                    </p>
                  )}

                  {/* Skills Pills */}
                  {(() => {
                    const skills = Array.isArray(app.worker?.workerProfile?.skills)
                      ? app.worker.workerProfile.skills
                      : [];
                    if (skills.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {skills.slice(0, 4).map((sk: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-700"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* 1-Click Hiring & Shortlisting Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="flex items-center gap-2">
                    <Link href="/employer/messages">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-3.5 h-3.5 mr-1" /> Chat
                      </Button>
                    </Link>

                    {app.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={processingId === app.id}
                        onClick={() => handleStatusUpdate(app.id, "SHORTLISTED")}
                      >
                        Shortlist
                      </Button>
                    )}
                  </div>

                  {app.status !== "ACCEPTED" ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={processingId === app.id}
                        onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                        className="text-xs"
                      >
                        Reject
                      </Button>

                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={processingId === app.id}
                        onClick={() => handleStatusUpdate(app.id, "ACCEPTED")}
                        className="font-bold bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Hire Candidate
                      </Button>
                    </div>
                  ) : (
                    <Link href="/employer/work">
                      <Button size="sm" variant="outline" className="font-bold text-emerald-700 border-emerald-300">
                        View Active Contract <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployerApplicantsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto py-12 px-4 text-center text-xs text-slate-400">
          Loading applicant pipeline...
        </div>
      }
    >
      <ApplicantsContent />
    </Suspense>
  );
}
