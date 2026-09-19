"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Search,
  Briefcase,
  Layers,
  MessageSquare,
  User,
  Users,
  PlusCircle,
  Shield,
} from "lucide-react";

export function MobileNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 md:hidden px-2 py-1 flex items-center justify-around shadow-lg">
      {user?.role !== "EMPLOYER" && (
        <Link
          href="/jobs"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            pathname === "/jobs" ? "text-brand-600 font-bold" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Discover</span>
        </Link>
      )}

      {user?.role === "WORKER" && (
        <>
          <Link
            href="/worker/applications"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              pathname === "/worker/applications" ? "text-brand-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Layers className="w-5 h-5 mb-0.5" />
            <span>Applied</span>
          </Link>
          <Link
            href="/worker/work"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              pathname === "/worker/work" ? "text-brand-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Briefcase className="w-5 h-5 mb-0.5" />
            <span>My Work</span>
          </Link>
          <Link
            href="/worker/messages"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              pathname === "/worker/messages" ? "text-brand-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span>Chat</span>
          </Link>
          <Link
            href="/worker/dashboard"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              pathname === "/worker/dashboard" ? "text-brand-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span>Hub</span>
          </Link>
        </>
      )}

      {user?.role === "EMPLOYER" && (
        <>
          <Link
            href="/employer/applicants"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              pathname === "/employer/applicants" ? "text-brand-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span>Applicants</span>
          </Link>
          <Link
            href="/employer/jobs/new"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              pathname === "/employer/jobs/new" ? "text-accent-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <PlusCircle className="w-5 h-5 mb-0.5 text-accent-500" />
            <span>Post</span>
          </Link>
          <Link
            href="/employer/work"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              pathname === "/employer/work" ? "text-brand-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Briefcase className="w-5 h-5 mb-0.5" />
            <span>Contracts</span>
          </Link>
          <Link
            href="/employer/dashboard"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              pathname === "/employer/dashboard" ? "text-brand-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span>Hub</span>
          </Link>
        </>
      )}

      {user?.role === "BOTH" && (
        <>
          <Link
            href="/jobs"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              pathname === "/jobs" ? "text-brand-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Search className="w-5 h-5 mb-0.5" />
            <span>Jobs</span>
          </Link>
          <Link
            href="/employer/jobs/new"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              pathname === "/employer/jobs/new" ? "text-accent-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <PlusCircle className="w-5 h-5 mb-0.5 text-accent-500" />
            <span>Post</span>
          </Link>
          <Link
            href="/worker/work"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              pathname === "/worker/work" ? "text-brand-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Briefcase className="w-5 h-5 mb-0.5" />
            <span>Work</span>
          </Link>
          <Link
            href="/worker/dashboard"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              pathname === "/worker/dashboard" ? "text-brand-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span>Hub</span>
          </Link>
        </>
      )}

      {user?.role === "ADMIN" && (
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            pathname.startsWith("/admin") ? "text-brand-600 font-bold" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Shield className="w-5 h-5 mb-0.5" />
          <span>Admin</span>
        </Link>
      )}

      {!user && (
        <Link
          href="/login"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            pathname === "/login" ? "text-brand-600 font-bold" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Sign In</span>
        </Link>
      )}
    </nav>
  );
}
