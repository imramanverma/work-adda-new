"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  TrendingUp,
  CreditCard,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [activeContracts, setActiveContracts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployerData() {
      try {
        const [profRes, appsRes, assignsRes, payRes] = await Promise.all([
          fetch("/api/employers/profile"),
          fetch("/api/applications"),
          fetch("/api/assignments"),
          fetch("/api/payments"),
        ]);

        if (profRes.ok) {
          const profData = await profRes.json();
          setProfile(profData.employer);
          setJobs(profData.employer?.jobs || []);
        }
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApplicants(appsData.applications || []);
        }
        if (assignsRes.ok) {
          const assignsData = await assignsRes.json();
          setActiveContracts(assignsData.assignments || []);
        }
        if (payRes.ok) {
          const payData = await payRes.json();
          setPayments(payData.payments || []);
        }
      } catch (e) {
        console.error("Employer dashboard error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadEmployerData();
  }, []);

  const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingApplicants = applicants.filter((a) => a.status === "PENDING").length;
  const activeWorkersCount = activeContracts.filter((c) => ["ASSIGNED", "IN_PROGRESS"].includes(c.status)).length;
  const completedContractsCount = activeContracts.filter((c) => ["APPROVED", "PAID"].includes(c.status)).length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-36 bg-white rounded-3xl border border-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Employer Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-bold text-accent-400">
                Employer Command Center
              </span>
              <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                Verified Business
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {profile?.businessName || user?.name || "Business Enterprise"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {profile?.businessType || "Local Business"} • Manage active job postings, hire local candidates, and disburse payouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/employer/jobs/new">
              <Button size="md" variant="accent" className="font-bold shadow-lg shadow-accent-500/20">
                <PlusCircle className="w-4 h-4 mr-1.5" /> Post New Work
              </Button>
            </Link>
            <Link href="/employer/applicants">
              <Button size="md" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Users className="w-4 h-4 mr-1.5" /> View Applicants ({pendingApplicants})
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Jobs</span>
              <Briefcase className="w-4 h-4 text-brand-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {jobs.filter((j) => j.status === "OPEN").length}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">Live in local feed</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Applicants</span>
              <Users className="w-4 h-4 text-accent-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{applicants.length}</p>
            <span className="text-[11px] text-accent-700 font-bold mt-1 block">
              {pendingApplicants} awaiting review
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Contracts</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{activeWorkersCount}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Workers performing tasks</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Payouts Cleared</span>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">
              {formatCurrency(totalSpent)}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {completedContractsCount} jobs completed & rated
            </span>
          </div>
        </div>

        {/* Main 2-Column Section: Active Postings & Applicant Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Manage Job Listings */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Your Posted Jobs</h3>
                <p className="text-xs text-slate-500">Live job listings accepting worker applications</p>
              </div>
              <Link href="/employer/jobs/new">
                <Button size="sm" variant="outline">
                  <PlusCircle className="w-4 h-4 mr-1" /> New Listing
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {jobs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                  <p className="text-xs text-slate-500 mb-3">You haven't posted any jobs yet.</p>
                  <Link href="/employer/jobs/new">
                    <Button size="sm" variant="accent">
                      Post First Work Listing
                    </Button>
                  </Link>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="brand">{job.category}</Badge>
                        <Badge variant={job.status === "OPEN" ? "success" : "default"}>
                          {job.status}
                        </Badge>
                      </div>
                      <Link href={`/jobs/${job.id}`}>
                        <h4 className="font-bold text-sm text-slate-900 hover:text-brand-600 transition">
                          {job.title}
                        </h4>
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>{formatCurrency(job.payAmount)}/{job.payType.toLowerCase()}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span className="font-bold text-brand-700">
                          {job._count?.applications || 0} applicants
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/employer/applicants?jobId=${job.id}`}>
                        <Button size="sm" variant="primary">
                          Review Applicants ({job._count?.applications || 0})
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right 1 Col: Recent Applicant Pipeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Recent Applicants</h3>
              <Link
                href="/employer/applicants"
                className="text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                Review All
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 divide-y divide-slate-100 shadow-xs">
              {applicants.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No applicants yet. Share your job to reach more local talent.
                </div>
              ) : (
                applicants.slice(0, 5).map((app) => (
                  <div key={app.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">{app.worker?.name}</h5>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          for {app.job?.title}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatDate(app.appliedAt)}
                        </span>
                      </div>
                      <Badge
                        variant={
                          app.status === "ACCEPTED"
                            ? "success"
                            : app.status === "SHORTLISTED"
                            ? "warning"
                            : "default"
                        }
                        className="text-[10px]"
                      >
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-700">Quick Employer Controls</h4>
              <ul className="space-y-1 text-slate-600">
                <li>
                  <Link href="/employer/work" className="hover:text-brand-600 flex items-center justify-between py-1">
                    <span>Manage Active Work & Approve Tasks</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
                <li>
                  <Link href="/employer/payments" className="hover:text-brand-600 flex items-center justify-between py-1">
                    <span>Payment Disbursals & Receipts</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
                <li>
                  <Link href="/employer/messages" className="hover:text-brand-600 flex items-center justify-between py-1">
                    <span>Candidate & Worker Direct Chat</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
