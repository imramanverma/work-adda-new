"use client";

import React from "react";
import { ChatView } from "@/components/chat/chat-view";

export default function EmployerMessagesPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-6">
      <div className="hidden sm:block mb-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Applicant & Worker Messages
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Chat with candidates, share location details, and discuss shift requirements in real-time.
        </p>
      </div>

      <ChatView defaultRecipientRole="WORKER" />
    </div>
  );
}
