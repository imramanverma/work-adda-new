"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import {
  Briefcase,
  PlusCircle,
  Users,
  MapPin,
  Clock,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function EmployerJobsManagerPage() {
  const toast = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/employers/profile");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.employer?.jobs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleMarkCompleted = async (id: string, title: string) => {
    if (!confirm(`Mark "${title}" as Completed? It will be removed from public listings.`)) return;

    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) {
        toast.success("Job Completed", `"${title}" has been marked as completed.`);
        fetchJobs();
      } else {
        const d = await res.json();
        toast.error("Error", d.error);
      }
    } catch (e: any) {
      toast.error("Error", e.message);
    }
  };

  const handleReopen = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "OPEN" }),
      });
      if (res.ok) {
        toast.success("Job Reopened", `"${title}" is now open for applications.`);
        fetchJobs();
      } else {
        const d = await res.json();
        toast.error("Error", d.error);
      }
    } catch (e: any) {
      toast.error("Error", e.message);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the job listing "${title}"?`)) return;

    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Job Deleted");
        fetchJobs();
      } else {
        const d = await res.json();
        toast.error("Error", d.error);
      }
    } catch (e: any) {
      toast.error("Error", e.message);
    }
  };

  const activeJobs = jobs.filter((j) => j.status === "OPEN");
  const completedJobs = jobs.filter((j) => j.status !== "OPEN");
  const displayedJobs = activeTab === "ACTIVE" ? activeJobs : completedJobs;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/employer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Manage Job Postings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track openings, view candidate counts, and archive completed positions.
            </p>
          </div>

          <Link href="/employer/jobs/new">
            <Button size="sm" variant="accent" className="font-bold">
              <PlusCircle className="w-4 h-4 mr-1.5" /> Post New Work
            </Button>
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "ACTIVE"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Active Listings ({activeJobs.length})
          </button>
          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "COMPLETED"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Completed / Closed ({completedJobs.length})
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-white rounded-3xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-900">
              {activeTab === "ACTIVE" ? "No active job listings" : "No completed jobs yet"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === "ACTIVE"
                ? "Create your first job posting to start receiving local applicants."
                : "Jobs will appear here once work is completed or closed."}
            </p>
            {activeTab === "ACTIVE" && (
              <Link href="/employer/jobs/new">
                <Button size="sm" variant="accent" className="mt-4 font-bold">
                  Post First Job
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Badge variant="brand">{job.category}</Badge>
                    <Badge variant={job.status === "OPEN" ? "success" : "default"}>
                      {job.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Posted: {formatDate(job.createdAt)}
                    </span>
                  </div>

                  <Link href={`/jobs/${job.id}`}>
                    <h3 className="font-bold text-base text-slate-900 hover:text-brand-600 transition">
                      {job.title}
                    </h3>
                  </Link>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-bold text-slate-900">
                      {job.budgetType === "PER_PAGE" || job.payType === "PER_PAGE"
                        ? `₹${job.pricePerUnit || 3}/page (Total: ${formatCurrency(job.payAmount)})`
                        : `${formatCurrency(job.payAmount)}/${job.payType?.toLowerCase()?.replace("_", " ")}`}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      {job.location}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-brand-700">
                      {job._count?.applications || 0} applicants
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Link href={`/employer/applicants?jobId=${job.id}`}>
                    <Button size="sm" variant="primary">
                      <Users className="w-3.5 h-3.5 mr-1" /> View Applicants ({job._count?.applications || 0})
                    </Button>
                  </Link>

                  {job.status === "OPEN" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkCompleted(job.id, job.title)}
                      className="text-blue-700 border-blue-200 hover:bg-blue-50"
                      title="Mark as completed and remove from public listings"
                    >
                      Complete Work
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReopen(job.id, job.title)}
                      className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      title="Reopen listing for applications"
                    >
                      Reopen
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(job.id, job.title)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
