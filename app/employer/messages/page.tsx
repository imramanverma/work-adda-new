"use client";

import React from "react";
import { ChatView } from "@/components/chat/chat-view";

export default function EmployerMessagesPage() {
  return (
    <div className="w-full max-w-7xl mx-auto h-[calc(100dvh-4rem)] md:h-[calc(100vh-4rem)] p-0 sm:p-2 md:p-3 -mb-16 md:mb-0 flex flex-col overflow-hidden">
      <ChatView defaultRecipientRole="WORKER" />
    </div>
  );
}
