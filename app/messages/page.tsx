"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { ChatView } from "@/components/chat/chat-view";
import Link from "next/link";
import { MessageSquare, ShieldCheck, ArrowRight, User } from "lucide-react";

function MessagesContent() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const convId = searchParams.get("conv");

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Sign in to view messages</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Direct chat is protected. Please sign in to communicate with workers, applicants, and employers.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition"
            >
              Sign In to Work Adda <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-6">
      {/* Top Banner on larger screens */}
      <div className="hidden sm:flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-brand-100/70 text-brand-700">
              <MessageSquare className="w-5 h-5" />
            </span>
            Direct Messages & Task Chat
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time coordination for shifts, directions, requirements, and live task updates.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted Direct Messaging</span>
        </div>
      </div>

      {/* Main High-Performance Chat View */}
      <ChatView
        defaultRecipientRole={user.role === "EMPLOYER" ? "WORKER" : "EMPLOYER"}
        initialConvId={convId}
      />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
