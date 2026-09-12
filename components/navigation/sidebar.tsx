"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  X,
  Search,
  LayoutDashboard,
  FileText,
  Briefcase,
  Wallet,
  MessageSquare,
  Bell,
  User,
  PlusCircle,
  Users,
  CreditCard,
  Building2,
  ShieldCheck,
  AlertTriangle,
  LogIn,
  UserPlus,
  LogOut,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Prevent scrolling when sidebar is open & close on ESC
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Sidebar Drawer */}
      <aside
        className="relative z-10 w-72 sm:w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col border-r border-slate-200 animate-in slide-in-from-left duration-250 ease-out"
        role="dialog"
        aria-modal="true"
      >
        {/* Header: Logo & Close Button */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" onClick={onClose} className="hover:opacity-95 transition">
            <Logo size="sm" />
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card (When logged in) */}
        {user ? (
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-accent-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-slate-900 truncate">{user.name}</h4>
                  {user.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="inline-block px-1.5 py-0.2 rounded bg-brand-100 text-brand-800 font-bold text-[9px] uppercase tracking-wider">
                    {user.role}
                  </span>
                  <span className="text-[10px] text-slate-400">• Fatehabad & Sirsa</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-brand-50/50 border-b border-brand-100/60">
            <h4 className="font-bold text-xs text-brand-900">Welcome to Work Adda</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Local employment & task marketplace for Fatehabad & Sirsa.
            </p>
          </div>
        )}

        {/* Navigation Items (The exact items moved from the top bar) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Universal Link: Find Work */}
          <Link
            href="/jobs"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              pathname.startsWith("/jobs")
                ? "bg-brand-50 text-brand-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Search className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Find Work</span>
          </Link>

          {/* Worker Navigation Links */}
          {user?.role === "WORKER" && (
            <div className="pt-2 space-y-1">
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Worker Hub
              </div>
              <Link
                href="/worker/dashboard"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/worker/dashboard"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Worker Hub</span>
              </Link>
              <Link
                href="/worker/applications"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/worker/applications"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                <span>My Applications</span>
              </Link>
              <Link
                href="/worker/work"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/worker/work"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Briefcase className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Active Work</span>
              </Link>
              <Link
                href="/worker/earnings"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/worker/earnings"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Wallet className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Earnings</span>
              </Link>
              <Link
                href="/worker/messages"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/worker/messages"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <MessageSquare className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Messages</span>
              </Link>
              <Link
                href="/worker/profile"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/worker/profile"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <User className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Profile & Skills</span>
              </Link>
            </div>
          )}

          {/* Employer Navigation Links */}
          {user?.role === "EMPLOYER" && (
            <div className="pt-2 space-y-1">
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Employer Hub
              </div>
              <Link
                href="/employer/jobs/new"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-slate-950 shrink-0" />
                <span>Post Work</span>
              </Link>
              <Link
                href="/employer/dashboard"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/employer/dashboard"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Employer Hub</span>
              </Link>
              <Link
                href="/employer/applicants"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/employer/applicants"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Users className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Applicants</span>
              </Link>
              <Link
                href="/employer/work"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/employer/work"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Briefcase className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Work Contracts</span>
              </Link>
              <Link
                href="/employer/payments"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/employer/payments"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <CreditCard className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Payments</span>
              </Link>
              <Link
                href="/employer/messages"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/employer/messages"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <MessageSquare className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Messages</span>
              </Link>
              <Link
                href="/employer/profile"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/employer/profile"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Company Profile</span>
              </Link>
            </div>
          )}

          {/* Admin Navigation Links */}
          {user?.role === "ADMIN" && (
            <div className="pt-2 space-y-1">
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Admin Panel
              </div>
              <Link
                href="/admin"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/admin"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Admin Overview</span>
              </Link>
              <Link
                href="/admin/users"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/admin/users"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Users className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Users</span>
              </Link>
              <Link
                href="/admin/jobs"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/admin/jobs"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Briefcase className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Jobs</span>
              </Link>
              <Link
                href="/admin/reports"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  pathname === "/admin/reports"
                    ? "bg-brand-50 text-brand-700 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Reports</span>
              </Link>
            </div>
          )}

          {/* Guest Links */}
          {!user && (
            <div className="pt-2 space-y-1">
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Account
              </div>
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <LogIn className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 transition shadow-xs"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>Create Free Account</span>
              </Link>
            </div>
          )}
        </div>

        {/* Footer: District Badge & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 text-[11px] font-semibold text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="truncate">Active: Fatehabad & Sirsa</span>
          </div>

          {user && (
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
