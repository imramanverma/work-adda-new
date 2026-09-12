"use client";

import React from "react";
import { ChatView } from "@/components/chat/chat-view";

export default function EmployerMessagesPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Applicant & Worker Messages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chat with candidates, share location details, and discuss shift requirements in real-time.
          </p>
        </div>

        <ChatView defaultRecipientRole="WORKER" />
      </div>
    </div>
  );
}
