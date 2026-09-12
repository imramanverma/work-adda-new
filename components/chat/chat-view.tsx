"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import {
  MessageSquare,
  Send,
  User,
  Building2,
  Clock,
  CheckCheck,
  Check,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function ChatView({ defaultRecipientRole = "EMPLOYER" }: { defaultRecipientRole?: "EMPLOYER" | "WORKER" }) {
  const { user } = useAuth();
  const toast = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        const list = data.conversations || [];
        setConversations(list);
        if (list.length > 0 && !activeConvId) {
          setActiveConvId(list[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Poll messages every 4 seconds for active conversation
  useEffect(() => {
    if (!activeConvId) return;

    let isMounted = true;
    async function loadMessages() {
      try {
        const res = await fetch(`/api/conversations/${activeConvId}/messages`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setMessages(data.messages || []);
          setActiveConv(data.conversation || null);
        }
      } catch {}
    }

    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConvId) return;

    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setInputMessage("");
      } else {
        const err = await res.json();
        toast.error("Error", err.error || "Failed to send");
      }
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[650px] bg-white rounded-3xl border border-slate-200 animate-pulse" />
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[700px] flex flex-col sm:flex-row">
      {/* Conversations Sidebar (Left) */}
      <div className="w-full sm:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            Conversations ({conversations.length})
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No chat conversations yet. Chats are started when applications are submitted or accepted.
            </div>
          ) : (
            conversations.map((c) => {
              const otherPartyName =
                user?.role === "WORKER"
                  ? c.employer?.employerProfile?.businessName || c.employer?.name
                  : c.worker?.name;

              const isActive = c.id === activeConvId;
              const lastMsg = c.messages?.[0];

              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full p-4 text-left transition flex items-start gap-3 ${
                    isActive ? "bg-brand-50/70 border-l-4 border-brand-600" : "hover:bg-slate-100/70"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {otherPartyName?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {otherPartyName}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-700 font-semibold truncate mt-0.5">
                      {c.job?.title}
                    </p>
                    {lastMsg && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {lastMsg.message}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Messages Thread (Right) */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConv ? (
          <>
            {/* Thread Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {user?.role === "WORKER"
                    ? activeConv.employer?.employerProfile?.businessName || activeConv.employer?.name
                    : activeConv.worker?.name}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Briefcase className="w-3 h-3 text-brand-600" />
                  Task: <strong>{activeConv.job?.title}</strong>
                </p>
              </div>
            </div>

            {/* Message Bubble Feed */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
              {messages.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  Start the conversation by sending a message below.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? "bg-brand-600 text-white rounded-br-xs shadow-xs"
                            : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs"
                        }`}
                      >
                        <p>{m.message}</p>
                        <span
                          className={`block text-[10px] mt-1 text-right ${
                            isMe ? "text-brand-200" : "text-slate-400"
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-slate-200 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your message here..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Button type="submit" size="sm" isLoading={sending} className="font-bold">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
            Select a conversation on the left to start messaging.
          </div>
        )}
      </div>
    </div>
  );
}
