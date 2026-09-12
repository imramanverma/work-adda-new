"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Briefcase,
  Bell,
  User,
  LogOut,
  ChevronDown,
  PlusCircle,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((d) => setNotifications(d.notifications || []))
        .catch(() => {});
    }
  }, [user, pathname]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-6">
          <Link href="/" className="transition hover:opacity-95">
            <Logo size="md" />
          </Link>

          {/* Main Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/jobs"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pathname.startsWith("/jobs")
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Find Work
            </Link>

            {user?.role === "WORKER" && (
              <>
                <Link
                  href="/worker/dashboard"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/worker/dashboard"
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Worker Hub
                </Link>
                <Link
                  href="/worker/applications"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/worker/applications"
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  My Applications
                </Link>
                <Link
                  href="/worker/work"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/worker/work"
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Active Work
                </Link>
                <Link
                  href="/worker/earnings"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/worker/earnings"
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Earnings
                </Link>
              </>
            )}

            {user?.role === "EMPLOYER" && (
              <>
                <Link
                  href="/employer/dashboard"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/employer/dashboard"
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Employer Hub
                </Link>
                <Link
                  href="/employer/applicants"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/employer/applicants"
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Applicants
                </Link>
                <Link
                  href="/employer/work"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/employer/work"
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Work Contracts
                </Link>
                <Link
                  href="/employer/payments"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/employer/payments"
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Payments
                </Link>
              </>
            )}

            {user?.role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/admin"
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Admin Panel
                </Link>
                <Link
                  href="/admin/users"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/admin/users"
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Users
                </Link>
                <Link
                  href="/admin/jobs"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/admin/jobs"
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Jobs
                </Link>
                <Link
                  href="/admin/reports"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/admin/reports"
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Reports
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Section: Actions, Notifications, User Profile */}
        <div className="flex items-center gap-3">


          {user?.role === "EMPLOYER" && (
            <Link href="/employer/jobs/new">
              <Button size="sm" variant="accent" className="hidden sm:inline-flex">
                <PlusCircle className="w-4 h-4 mr-1" /> Post Work
              </Button>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              {/* Messages Shortcut */}
              <Link
                href={user.role === "EMPLOYER" ? "/employer/messages" : "/worker/messages"}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>

              {/* Notifications Popover */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                      <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 text-left text-xs hover:bg-slate-50 transition ${
                              !n.isRead ? "bg-brand-50/40" : ""
                            }`}
                          >
                            <p className="font-semibold text-slate-900">{n.title}</p>
                            <p className="text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 border border-slate-200 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{user.name.split(" ")[0]}</p>
                    <span className="text-[10px] text-brand-700 font-semibold uppercase">{user.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-sm text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      href={
                        user.role === "WORKER"
                          ? "/worker/profile"
                          : user.role === "EMPLOYER"
                          ? "/employer/profile"
                          : "/admin"
                      }
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <User className="w-4 h-4 text-slate-400" /> Profile Settings
                    </Link>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Join Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
