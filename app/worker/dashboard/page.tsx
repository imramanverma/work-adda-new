"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  Sparkles,
  MapPin,
  Clock,
  Briefcase,
  IndianRupee,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatJobPay } from "@/lib/utils";
import { formatDistance } from "@/lib/location";

export default function WorkerDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>({ totalEarned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [profRes, jobsRes, appsRes, assignsRes, earnRes] = await Promise.all([
          fetch("/api/workers/profile"),
          fetch("/api/jobs?limit=4&sortBy=relevance"),
          fetch("/api/applications"),
          fetch("/api/assignments?status=ASSIGNED,IN_PROGRESS"),
          fetch("/api/payments"),
        ]);

        if (profRes.ok) {
          const profData = await profRes.json();
          setProfile(profData.profile);
        }
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setRecommendedJobs(jobsData.jobs || []);
        }
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApplications(appsData.applications?.slice(0, 5) || []);
        }
        if (assignsRes.ok) {
          const assignsData = await assignsRes.json();
          setActiveAssignments(assignsData.assignments || []);
        }
        if (earnRes.ok) {
          const earnData = await earnRes.json();
          setEarnings(earnData.stats || { totalEarned: 0 });
        }
      } catch (e) {
        console.error("Worker dash error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-32 bg-white rounded-3xl border border-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          <div className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse md:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Greeting & Stats Banner */}
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-accent-400">
              Worker Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Welcome back, {user?.name || "Worker"}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-brand-100 mt-1 max-w-xl">
              Here is your active work status, nearby recommended tasks, and verified earnings.
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 text-center">
              <span className="text-xl sm:text-2xl font-black text-accent-400">
                {profile?.rating > 0 ? profile.rating.toFixed(1) : "New"}
              </span>
              <p className="text-[11px] text-brand-200 mt-0.5">Rating (★)</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 text-center">
              <span className="text-xl sm:text-2xl font-black text-white">
                {profile?.completedJobs || 0}
              </span>
              <p className="text-[11px] text-brand-200 mt-0.5">Tasks Done</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 text-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-400">
                {formatCurrency(earnings.totalEarned || 0)}
              </span>
              <p className="text-[11px] text-brand-200 mt-0.5">Net Earned</p>
            </div>
          </div>
        </div>

        {/* Profile Completion Bar */}
        {profile && profile.completionPercentage < 100 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Profile Completion</span>
                <span className="text-brand-600">{profile.completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${profile.completionPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Add skills, experience, and availability to increase employer hiring response.
              </p>
            </div>
            <Link href="/worker/profile" className="shrink-0">
              <Button size="sm" variant="outline">
                Complete Profile
              </Button>
            </Link>
          </div>
        )}

        {/* Active Work Contract Alert Card */}
        {activeAssignments.length > 0 && (
          <div className="bg-amber-50/80 border border-amber-200 p-5 rounded-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Active Assignment: {activeAssignments[0].job?.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Hired by {activeAssignments[0].employer?.employerProfile?.businessName || "Employer"} • Agreed Pay: {formatCurrency(activeAssignments[0].agreedAmount)}
                  </p>
                </div>
              </div>
              <Link href="/worker/work">
                <Button size="sm" variant="accent" className="font-bold">
                  View & Mark Complete <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* 2-Column Section: Recommended Jobs & Recent Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Smart Recommended Jobs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-accent-500" /> Recommended For You
                </h3>
                <p className="text-xs text-slate-500">
                  Sorted by algorithm match score and nearby proximity
                </p>
              </div>
              <Link href="/jobs" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {recommendedJobs.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                  <p className="text-xs text-slate-500">No recommended jobs right now.</p>
                </div>
              ) : (
                recommendedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="brand">{job.category}</Badge>
                        {job.matchScore !== null && (
                          <Badge variant="success" className="font-bold text-[11px]">
                            <Sparkles className="w-3 h-3 text-accent-500 mr-1" />
                            {job.matchScore}% Match
                          </Badge>
                        )}
                      </div>
                      <Link href={`/jobs/${job.id}`}>
                        <h4 className="font-bold text-sm text-slate-900 hover:text-brand-600 transition">
                          {job.title}
                        </h4>
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>{job.employer?.businessName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-brand-600" />
                          {job.location}
                        </span>
                        {job.distanceKm !== null && (
                          <span className="font-bold text-brand-700">
                            ({formatDistance(job.distanceKm)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0">
                      {(() => {
                        const { rateText, subText } = formatJobPay(job);
                        return (
                          <div className="text-right">
                            <span className="font-black text-base text-slate-900 block">
                              {rateText}
                            </span>
                            {subText && (
                              <span className="text-[11px] font-semibold text-emerald-700 block">
                                {subText}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                      <Link href={`/jobs/${job.id}`}>
                        <Button size="sm" variant="outline">
                          View & Apply
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right 1 Col: Recent Applications Pipeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Recent Applications</h3>
              <Link
                href="/worker/applications"
                className="text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                See All
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 divide-y divide-slate-100 shadow-xs">
              {applications.length === 0 ? (
                <div className="py-8 text-center">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">You haven't applied to any jobs yet.</p>
                  <Link href="/jobs">
                    <Button size="sm" variant="primary" className="mt-3">
                      Discover Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 line-clamp-1">
                          {app.job?.title}
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          {app.job?.employer?.businessName} • {formatDate(app.appliedAt)}
                        </p>
                      </div>
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
                        className="text-[10px]"
                      >
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Links Card */}
            <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-700">Quick Worker Actions</h4>
              <ul className="space-y-1 text-slate-600">
                <li>
                  <Link href="/worker/earnings" className="hover:text-brand-600 flex items-center justify-between py-1">
                    <span>View Payout History & Tax Slips</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
                <li>
                  <Link href="/worker/messages" className="hover:text-brand-600 flex items-center justify-between py-1">
                    <span>Chat with Local Employers</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
                <li>
                  <Link href="/worker/profile" className="hover:text-brand-600 flex items-center justify-between py-1">
                    <span>Update Skills & Availability</span>
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
