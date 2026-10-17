"use client";

import React from "react";
import { ChatView } from "@/components/chat/chat-view";

export default function WorkerMessagesPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-6">
      <div className="hidden sm:block mb-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Messages & Employer Communication
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Coordinate task locations, timings, and instructions with hiring employers in real-time.
        </p>
      </div>

      <ChatView defaultRecipientRole="EMPLOYER" />
    </div>
  );
}
