"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import {
  Briefcase,
  Search,
  Trash2,
  ArrowLeft,
  Building2,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminJobsPage() {
  const toast = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);

      const res = await fetch(`/api/admin/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search]);

  const handleDeleteJob = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete the job "${title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/jobs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Job Listing Removed", "The fraudulent or obsolete job was deleted.");
        fetchJobs();
      } else {
        const data = await res.json();
        toast.error("Error", data.error);
      }
    } catch (e: any) {
      toast.error("Error", e.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Overview
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Job Listings Moderation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Inspect job descriptions, report flags, and take down fraudulent or policy-violating listings.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search job title, locality, business name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading job listings...</div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No jobs match search criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Job Title</th>
                    <th className="px-6 py-3.5">Employer</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Compensation</th>
                    <th className="px-6 py-3.5">Applicants</th>
                    <th className="px-6 py-3.5">Reports</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {jobs.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <Link href={`/jobs/${j.id}`} className="font-bold text-slate-900 hover:text-brand-600 block">
                          {j.title}
                        </Link>
                        <span className="text-[11px] text-slate-400">{j.location}</span>
                      </td>
                      <td className="px-6 py-4">
                        {j.employer?.businessName}
                        <span className="text-[10px] text-slate-400 block">{j.employer?.user?.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="brand">{j.category}</Badge>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatCurrency(j.payAmount)}/{j.payType.toLowerCase()}
                      </td>
                      <td className="px-6 py-4">{j._count?.applications || 0}</td>
                      <td className="px-6 py-4">
                        {j._count?.reports > 0 ? (
                          <Badge variant="danger" className="font-bold">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {j._count.reports} Reported
                          </Badge>
                        ) : (
                          <span className="text-slate-400">Clean</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="danger"
                          isLoading={deletingId === j.id}
                          onClick={() => handleDeleteJob(j.id, j.title)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
