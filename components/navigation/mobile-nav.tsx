"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Home,
  Search,
  Briefcase,
  Layers,
  MessageSquare,
  User,
  Users,
  PlusCircle,
  Shield,
  LogIn,
} from "lucide-react";

export function MobileNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  const getLinkClasses = (href: string) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
    return `flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-xl text-[10px] font-bold transition-all select-none ${
      isActive
        ? "text-brand-700 bg-brand-50/80 font-black scale-105"
        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
    }`;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 md:hidden px-2 py-1 pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-lg shadow-slate-900/10">
      {/* 1. Guest Visitor View */}
      {!user && (
        <>
          <Link href="/" className={getLinkClasses("/")}>
            <Home className="w-4 h-4 mb-0.5" />
            <span>Home</span>
          </Link>
          <Link href="/jobs" className={getLinkClasses("/jobs")}>
            <Search className="w-4 h-4 mb-0.5" />
            <span>Find Work</span>
          </Link>
          <Link
            href="/employer/jobs/new"
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-xl text-[10px] font-extrabold text-slate-900 transition-all select-none"
          >
            <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="mt-0.5 text-amber-700">Post</span>
          </Link>
          <Link href="/login" className={getLinkClasses("/login")}>
            <LogIn className="w-4 h-4 mb-0.5" />
            <span>Sign In</span>
          </Link>
        </>
      )}

      {/* 2. Worker View */}
      {user?.role === "WORKER" && (
        <>
          <Link href="/jobs" className={getLinkClasses("/jobs")}>
            <Search className="w-4 h-4 mb-0.5" />
            <span>Find Work</span>
          </Link>
          <Link href="/worker/applications" className={getLinkClasses("/worker/applications")}>
            <Layers className="w-4 h-4 mb-0.5" />
            <span>Applied</span>
          </Link>
          <Link href="/worker/work" className={getLinkClasses("/worker/work")}>
            <Briefcase className="w-4 h-4 mb-0.5" />
            <span>My Gigs</span>
          </Link>
          <Link href="/worker/messages" className={getLinkClasses("/worker/messages")}>
            <MessageSquare className="w-4 h-4 mb-0.5" />
            <span>Chat</span>
          </Link>
          <Link href="/worker/dashboard" className={getLinkClasses("/worker/dashboard")}>
            <User className="w-4 h-4 mb-0.5" />
            <span>Hub</span>
          </Link>
        </>
      )}

      {/* 3. Employer View */}
      {user?.role === "EMPLOYER" && (
        <>
          <Link href="/employer/dashboard" className={getLinkClasses("/employer/dashboard")}>
            <User className="w-4 h-4 mb-0.5" />
            <span>Overview</span>
          </Link>
          <Link href="/employer/applicants" className={getLinkClasses("/employer/applicants")}>
            <Users className="w-4 h-4 mb-0.5" />
            <span>Applicants</span>
          </Link>
          <Link
            href="/employer/jobs/new"
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-xl text-[10px] font-extrabold text-slate-900 transition-all select-none"
          >
            <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="mt-0.5 text-amber-700">Post Gig</span>
          </Link>
          <Link href="/employer/work" className={getLinkClasses("/employer/work")}>
            <Briefcase className="w-4 h-4 mb-0.5" />
            <span>Contracts</span>
          </Link>
          <Link href="/employer/messages" className={getLinkClasses("/employer/messages")}>
            <MessageSquare className="w-4 h-4 mb-0.5" />
            <span>Chat</span>
          </Link>
        </>
      )}

      {/* 4. Dual View (Worker + Employer) */}
      {user?.role === "BOTH" && (
        <>
          <Link href="/jobs" className={getLinkClasses("/jobs")}>
            <Search className="w-4 h-4 mb-0.5" />
            <span>Find Work</span>
          </Link>
          <Link
            href="/employer/jobs/new"
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-xl text-[10px] font-extrabold text-slate-900 transition-all select-none"
          >
            <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="mt-0.5 text-amber-700">Post</span>
          </Link>
          <Link href="/worker/work" className={getLinkClasses("/worker/work")}>
            <Briefcase className="w-4 h-4 mb-0.5" />
            <span>My Gigs</span>
          </Link>
          <Link href="/worker/messages" className={getLinkClasses("/worker/messages")}>
            <MessageSquare className="w-4 h-4 mb-0.5" />
            <span>Chat</span>
          </Link>
          <Link href="/worker/dashboard" className={getLinkClasses("/worker/dashboard")}>
            <User className="w-4 h-4 mb-0.5" />
            <span>Hub</span>
          </Link>
        </>
      )}

      {/* 5. Admin View */}
      {user?.role === "ADMIN" && (
        <>
          <Link href="/admin" className={getLinkClasses("/admin")}>
            <Shield className="w-4 h-4 mb-0.5" />
            <span>Admin</span>
          </Link>
          <Link href="/admin/users" className={getLinkClasses("/admin/users")}>
            <Users className="w-4 h-4 mb-0.5" />
            <span>Users</span>
          </Link>
          <Link href="/admin/jobs" className={getLinkClasses("/admin/jobs")}>
            <Briefcase className="w-4 h-4 mb-0.5" />
            <span>Jobs</span>
          </Link>
          <Link href="/admin/reports" className={getLinkClasses("/admin/reports")}>
            <Shield className="w-4 h-4 mb-0.5" />
            <span>Reports</span>
          </Link>
        </>
      )}
    </nav>
  );
}
