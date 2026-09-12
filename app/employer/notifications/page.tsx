"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  Bell,
  CheckCheck,
  ShieldCheck,
  Briefcase,
  Users,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function EmployerNotificationsPage() {
  const router = useRouter();
  const toast = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch {}
  };

  const getTargetUrl = (n: any) => {
    const type = n.type?.toUpperCase() || "";
    const title = n.title?.toLowerCase() || "";
    const msg = n.message?.toLowerCase() || "";

    if (type === "APPLICATION" || title.includes("applicant") || msg.includes("applied") || msg.includes("candidate")) {
      return "/employer/applicants";
    }
    if (type === "PAYMENT" || title.includes("escrow") || title.includes("payment") || msg.includes("payment") || msg.includes("escrow")) {
      return "/employer/work";
    }
    if (type === "ASSIGNMENT" || title.includes("complete") || msg.includes("completed") || msg.includes("approved")) {
      return "/employer/work";
    }
    if (type === "MESSAGE" || title.includes("message")) {
      return "/employer/messages";
    }
    return "/employer/dashboard";
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
      );
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: n.id }),
        });
      } catch (err) {
        console.error(err);
      }
    }
    const targetUrl = getTargetUrl(n);
    router.push(targetUrl);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Employer Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              New applicant alerts, work completion submissions, and escrow updates.
            </p>
          </div>
          {notifications.some((n) => !n.isRead) && (
            <Button size="sm" variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-1.5" /> Mark all read
            </Button>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No notifications in your inbox.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = !n.isRead;
              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  role="button"
                  tabIndex={0}
                  className={`p-5 flex items-start gap-4 transition cursor-pointer select-none ${
                    isUnread
                      ? "bg-brand-50/50 hover:bg-brand-50"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      n.type === "APPLICATION"
                        ? "bg-blue-100 text-brand-700"
                        : n.type === "PAYMENT"
                        ? "bg-emerald-100 text-emerald-700"
                        : n.type === "ASSIGNMENT"
                        ? "bg-amber-100 text-amber-700"
                        : isUnread
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {n.type === "APPLICATION" ? (
                      <Users className="w-4 h-4" />
                    ) : n.type === "PAYMENT" ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : n.type === "ASSIGNMENT" ? (
                      <Briefcase className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 self-center shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
