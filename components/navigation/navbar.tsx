"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import {
  Briefcase,
  Bell,
  User,
  LogOut,
  ChevronDown,
  PlusCircle,
  MessageSquare,
  ShieldCheck,
  PanelLeft,
  Search,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { Sidebar } from "@/components/navigation/sidebar";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(navSearch.trim())}`);
    } else {
      router.push("/jobs");
    }
  };

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
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Section: Sidebar Toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5 focus:outline-none"
            aria-label="Open left sidebar menu"
            title="Open Navigation"
          >
            <PanelLeft className="w-5 h-5 text-slate-700" />
            <span className="hidden lg:inline text-xs font-bold text-slate-600">{t("nav.menu")}</span>
          </button>

          <Link href="/" className="transition hover:opacity-95 flex items-center">
            <Logo size="md" />
          </Link>
        </div>

        {/* Center Section: Quick Search filling the blank section */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6 hidden sm:flex items-center">
          <form
            onSubmit={handleNavSearch}
            className="w-full relative flex items-center bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white border border-slate-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 rounded-full pl-3.5 pr-1.5 py-1 transition shadow-xs"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder={t("nav.search_placeholder")}
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
            />
            <div className="hidden md:flex items-center gap-1 shrink-0 ml-2 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200/70 text-[10px] font-extrabold text-brand-700">
              <MapPin className="w-3 h-3 text-brand-600" />
              <span>Fatehabad & Sirsa</span>
            </div>
            <button
              type="submit"
              className="ml-2 px-3.5 py-1.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold transition shrink-0"
            >
              {t("nav.search_btn")}
            </button>
          </form>
        </div>

        {/* Right Section: Actions, Notifications, User Profile */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher className="hidden sm:inline-flex" />

          {user?.role === "EMPLOYER" && (
            <Link href="/employer/jobs/new">
              <Button size="sm" variant="accent" className="hidden sm:inline-flex">
                <PlusCircle className="w-4 h-4 mr-1" /> {t("nav.post_work")}
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
                      <User className="w-4 h-4 text-slate-400" /> {t("nav.profile")}
                    </Link>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> {t("nav.sign_out")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t("nav.sign_in")}
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  {t("nav.join_now")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
  </>
);
}
