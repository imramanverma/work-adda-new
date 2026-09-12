"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  User,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function AdminReportsPage() {
  const toast = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const url = statusFilter === "ALL" ? "/api/admin/reports" : `/api/admin/reports?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const updateReportStatus = async (id: string, status: "RESOLVED" | "DISMISSED") => {
    setProcessingId(id);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        toast.success("Report Updated", `Report has been marked as ${status.toLowerCase()}.`);
        fetchReports();
      } else {
        const data = await res.json();
        toast.error("Error", data.error);
      }
    } catch (e: any) {
      toast.error("Error", e.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Overview
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Community Incident & Fraud Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Investigate suspicious jobs, advance fee requests, and inappropriate behavior reported by users.
            </p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          {["PENDING", "RESOLVED", "DISMISSED", "ALL"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === s
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Reports Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 bg-white rounded-3xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-900">Queue is Clear</h3>
            <p className="text-xs text-slate-500 mt-1">No pending community reports requiring review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="danger" className="font-bold">
                      {r.reason}
                    </Badge>
                    <Badge
                      variant={r.status === "RESOLVED" ? "success" : r.status === "DISMISSED" ? "default" : "warning"}
                    >
                      {r.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                </div>

                <div className="text-xs space-y-2 text-slate-700">
                  <p className="bg-red-50/60 p-3 rounded-2xl border border-red-100 text-red-950 italic">
                    "{r.description}"
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-slate-500 pt-1">
                    <span>
                      Reported by: <strong>{r.reporter?.name}</strong> ({r.reporter?.role})
                    </span>
                    {r.job && (
                      <span>
                        Target Job: <strong>{r.job.title}</strong>
                      </span>
                    )}
                    {r.reportedUser && (
                      <span>
                        Target User: <strong>{r.reportedUser.name}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {r.status === "PENDING" && (
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={processingId === r.id}
                      onClick={() => updateReportStatus(r.id, "DISMISSED")}
                    >
                      Dismiss Report
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={processingId === r.id}
                      onClick={() => updateReportStatus(r.id, "RESOLVED")}
                      className="font-bold bg-emerald-600 hover:bg-emerald-700"
                    >
                      Mark Resolved
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
