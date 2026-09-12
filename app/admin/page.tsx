"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Briefcase,
  Layers,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminOverviewPage() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-32 bg-white rounded-3xl border border-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const s = analytics?.stats || {};

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-accent-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-accent-400">
                Work Adda Administration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Platform Moderation & Analytics</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              System-wide metrics, active jobs, user compliance, and financial transaction health.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/reports">
              <Button size="sm" variant="accent" className="font-bold">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Reports Queue ({s.pendingReports || 0})
              </Button>
            </Link>
          </div>
        </div>

        {/* Top 4 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{s.totalUsers || 0}</span>
              <Users className="w-5 h-5 text-brand-600" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {s.totalWorkers} Workers • {s.totalEmployers} Employers
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jobs Posted</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{s.totalJobs || 0}</span>
              <Briefcase className="w-5 h-5 text-accent-600" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{s.activeJobs} Currently Open</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total GMV Volume</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                {formatCurrency(s.totalTransactionVolume || 0)}
              </span>
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {formatCurrency(s.totalPlatformRevenue || 0)} platform fee (5%)
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contracts Fulfilled</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-blue-600">{s.completedAssignments || 0}</span>
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{s.activeAssignments} Active in Progress</p>
          </div>
        </div>

        {/* 2-Column Section: Category Distribution & Moderation Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Popular Job Categories */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Job Category Distribution</h3>
                <p className="text-xs text-slate-500">Breakdown of opportunities by trade sector</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(analytics?.categoryBreakdown || []).map((cat: any, i: number) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-bold text-xs text-slate-800 block truncate">{cat.category}</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-black text-brand-600">{cat.count}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Jobs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 1 Col: Management Links */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-base text-slate-900">Moderation Modules</h3>

              <div className="space-y-2">
                <Link
                  href="/admin/users"
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 transition group"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-brand-600" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Manage Users</span>
                      <span className="text-[10px] text-slate-500">Suspend, verify, view profiles</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
                </Link>

                <Link
                  href="/admin/jobs"
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 transition group"
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-accent-600" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Moderate Jobs</span>
                      <span className="text-[10px] text-slate-500">Inspect & delete fraudulent jobs</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
                </Link>

                <Link
                  href="/admin/reports"
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 transition group"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Community Reports</span>
                      <span className="text-[10px] text-slate-500">Review flagged content ({s.pendingReports})</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
                </Link>

                <Link
                  href="/admin/payments"
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 transition group"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Escrow Vault & Disputes</span>
                      <span className="text-[10px] text-slate-500">Arbitration, escrow balances, ledger</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
                </Link>
              </div>
            </div>

            {/* Recent Registrations Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="font-bold text-xs text-slate-700">Recent Registrations</h4>
              <div className="divide-y divide-slate-100">
                {(analytics?.recentUsers || []).map((u: any) => (
                  <div key={u.id} className="py-2 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{u.name}</span>
                      <span className="text-[10px] text-slate-400">{u.location || "North India"}</span>
                    </div>
                    <Badge variant={u.role === "WORKER" ? "brand" : "warning"} className="text-[10px]">
                      {u.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
