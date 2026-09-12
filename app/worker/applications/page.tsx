"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import {
  Briefcase,
  MapPin,
  Clock,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function WorkerApplicationsPage() {
  const toast = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchApplications = async () => {
    try {
      const url = filterStatus === "ALL" ? "/api/applications" : `/api/applications?status=${filterStatus}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const handleWithdraw = async (appId: string) => {
    if (!confirm("Are you sure you want to withdraw this job application?")) return;

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "WITHDRAWN" }),
      });

      if (res.ok) {
        toast.info("Application Withdrawn", "You have successfully withdrawn your application.");
        fetchApplications();
      } else {
        const data = await res.json();
        toast.error("Error", data.error);
      }
    } catch (err: any) {
      toast.error("Error", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Job Applications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track your hiring progress, shortlist statuses, and employer acceptances in real-time.
            </p>
          </div>
          <Link href="/jobs">
            <Button size="sm" variant="primary">
              Explore More Gigs
            </Button>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["ALL", "PENDING", "SHORTLISTED", "ACCEPTED", "REJECTED", "WITHDRAWN"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterStatus === status
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-900">No applications found</h3>
            <p className="text-xs text-slate-500 mt-1">
              You haven't submitted any applications with this filter yet.
            </p>
            <Link href="/jobs">
              <Button size="sm" variant="outline" className="mt-4">
                Discover Nearby Jobs
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-xl">
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
                      Applied on {formatDate(app.appliedAt)}
                    </span>
                  </div>

                  <Link href={`/jobs/${app.job?.id}`}>
                    <h3 className="text-base font-bold text-slate-900 hover:text-brand-600 transition">
                      {app.job?.title}
                    </h3>
                  </Link>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {app.job?.employer?.businessName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      {app.job?.employer?.location || "Local"}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-slate-900">
                      Proposed: {formatCurrency(app.proposedPay || app.job?.payAmount)}
                    </span>
                  </div>

                  {app.coverMessage && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{app.coverMessage}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {app.status === "ACCEPTED" ? (
                    <Link href="/worker/work">
                      <Button size="sm" variant="primary" className="font-bold">
                        Go to Work Contract <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  ) : app.status === "PENDING" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleWithdraw(app.id)}
                      className="text-red-600 hover:bg-red-50 text-xs"
                    >
                      Withdraw Application
                    </Button>
                  ) : (
                    <Link href={`/jobs/${app.job?.id}`}>
                      <Button size="sm" variant="outline">
                        View Job
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
