"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (roleFilter !== "ALL") params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const toggleUserStatus = async (userId: string, currentActive: boolean) => {
    setProcessingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !currentActive }),
      });

      if (res.ok) {
        toast.info(
          currentActive ? "User Suspended" : "User Activated",
          `User account is now ${!currentActive ? "active" : "suspended"}.`
        );
        fetchUsers();
      } else {
        const err = await res.json();
        toast.error("Error", err.error);
      }
    } catch (e: any) {
      toast.error("Error", e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const toggleVerification = async (userId: string, currentVerified: boolean) => {
    setProcessingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isVerified: !currentVerified }),
      });

      if (res.ok) {
        toast.success(
          !currentVerified ? "User Verified" : "Verification Revoked",
          "Verification status updated."
        );
        fetchUsers();
      }
    } catch (e: any) {
      toast.error("Error", e.message);
    } finally {
      setProcessingId(null);
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
              User Directory & Trust Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verify credentials, review community ratings, and enforce suspensions against fraudulent accounts.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search user name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {["ALL", "WORKER", "EMPLOYER", "ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  roleFilter === r
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No users match criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5">Verification</th>
                    <th className="px-6 py-3.5">Account State</th>
                    <th className="px-6 py-3.5 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[11px] text-slate-400 block">{u.email}</span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              {u.phone}
                              {u.phoneVerified && (
                                <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold" title="Phone Verified">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span className="text-[9px]">Verified</span>
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={u.role === "WORKER" ? "brand" : u.role === "EMPLOYER" ? "warning" : "default"}
                          className="font-bold"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">{u.location || "N/A"}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleVerification(u.id, u.isVerified)}
                          disabled={processingId === u.id}
                          className="hover:opacity-80 transition"
                        >
                          {u.isVerified ? (
                            <Badge variant="success" className="font-bold cursor-pointer">
                              <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="cursor-pointer">
                              Unverified
                            </Badge>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.isActive ? "success" : "danger"} className="font-bold">
                          {u.isActive ? "Active" : "Suspended"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== "ADMIN" && (
                          <Button
                            size="sm"
                            variant={u.isActive ? "danger" : "secondary"}
                            disabled={processingId === u.id}
                            onClick={() => toggleUserStatus(u.id, u.isActive)}
                            className="text-xs"
                          >
                            {u.isActive ? "Suspend User" : "Activate User"}
                          </Button>
                        )}
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
