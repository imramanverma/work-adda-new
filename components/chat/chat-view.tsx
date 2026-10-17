"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
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
  ArrowLeft,
  Search,
  Phone,
  ExternalLink,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface ChatViewProps {
  defaultRecipientRole?: "EMPLOYER" | "WORKER";
  initialConvId?: string | null;
}

interface OptimisticMessage {
  id: string;
  conversationId: string;
  senderId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  isOptimistic?: boolean;
  failed?: boolean;
}

export function ChatView({ defaultRecipientRole = "EMPLOYER", initialConvId = null }: ChatViewProps) {
  const { user } = useAuth();
  const toast = useToast();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConvId);
  const [messages, setMessages] = useState<OptimisticMessage[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "thread">(initialConvId ? "thread" : "list");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottomRef = useRef(true);
  const latestMessageIdRef = useRef<string | null>(null);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        const list = data.conversations || [];
        setConversations(list);

        if (list.length > 0 && !activeConvId && !initialConvId) {
          // On desktop, auto-select first conversation. On mobile, keep list view
          const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
          if (!isMobile) {
            setActiveConvId(list[0].id);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load conversations:", e);
    } finally {
      setLoading(false);
    }
  }, [activeConvId, initialConvId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load and smart-poll messages for active conversation
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      setActiveConv(null);
      return;
    }

    let isMounted = true;
    let pollTimer: any = null;

    async function loadMessages(isInitial = false) {
      if (typeof document !== "undefined" && document.hidden) return;

      try {
        const res = await fetch(`/api/conversations/${activeConvId}/messages`, {
          cache: "no-store",
        });

        if (res.ok && isMounted) {
          const data = await res.json();
          const incomingMessages: OptimisticMessage[] = data.messages || [];

          // Compare with current to avoid unnecessary re-renders and scroll thrashing
          const lastIncomingId = incomingMessages[incomingMessages.length - 1]?.id || null;
          if (isInitial || lastIncomingId !== latestMessageIdRef.current) {
            latestMessageIdRef.current = lastIncomingId;

            setMessages((prev) => {
              // Preserve any pending optimistic messages that haven't finalized
              const pending = prev.filter((m) => m.isOptimistic && m.failed);
              return [...incomingMessages, ...pending];
            });

            setActiveConv(data.conversation || null);

            // Auto-scroll on initial load or if user is near bottom
            if (isInitial || isScrolledToBottomRef.current) {
              requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({
                  behavior: isInitial ? "auto" : "smooth",
                });
              });
            }
          }
        }
      } catch (e) {
        // Silent fail for polling errors
      }
    }

    // Initial load
    loadMessages(true);

    // Smart poll every 3.5s
    pollTimer = setInterval(() => loadMessages(false), 3500);

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
    };
  }, [activeConvId]);

  // Track scroll position to prevent jerking when user reads old messages
  const handleScroll = () => {
    if (!messageContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
    isScrolledToBottomRef.current = scrollHeight - scrollTop - clientHeight < 120;
  };

  // High performance optimistic message sender (Zero delay on mobile!)
  const sendMessageText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !activeConvId || !user) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const optimisticMsg: OptimisticMessage = {
      id: tempId,
      conversationId: activeConvId,
      senderId: user.id,
      message: trimmed,
      isRead: false,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // 1. Immediately append message to UI (0ms perceived latency!)
    setMessages((prev) => [...prev, optimisticMsg]);
    setInputMessage("");

    // 2. Immediately scroll to bottom
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    // 3. Send to server in background
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace optimistic placeholder with real confirmed message
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...data.message, isOptimistic: false } : m))
        );
        latestMessageIdRef.current = data.message.id;
        // Refresh conversation sidebar previews
        fetchConversations();
      } else {
        const err = await res.json();
        toast.error("Failed to deliver", err.error || "Message delivery failed");
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, failed: true, isOptimistic: false } : m))
        );
      }
    } catch (err: any) {
      toast.error("Network issue", "Could not send message. Please check connection.");
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, failed: true, isOptimistic: false } : m))
      );
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageText(inputMessage);
  };

  const selectConversation = (id: string) => {
    setActiveConvId(id);
    setMobileView("thread");
  };

  // Filter conversations with search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const otherParty =
        user?.role === "WORKER"
          ? c.employer?.employerProfile?.businessName || c.employer?.name
          : c.worker?.name;
      const jobTitle = c.job?.title || "";
      const lastMsg = c.messages?.[0]?.message || "";
      return (
        otherParty?.toLowerCase().includes(q) ||
        jobTitle.toLowerCase().includes(q) ||
        lastMsg.toLowerCase().includes(q)
      );
    });
  }, [conversations, searchQuery, user?.role]);

  // Derive other party details for active conversation
  const otherPartyInfo = useMemo(() => {
    if (!activeConv || !user) return null;
    const isWorker = user.role === "WORKER";
    const name = isWorker
      ? activeConv.employer?.employerProfile?.businessName || activeConv.employer?.name
      : activeConv.worker?.name;
    const phone = isWorker ? activeConv.employer?.phone : activeConv.worker?.phone;
    const image = isWorker
      ? activeConv.employer?.employerProfile?.shopImage || activeConv.employer?.profileImage
      : activeConv.worker?.profileImage;
    const roleLabel = isWorker ? "Employer" : "Candidate / Worker";

    return { name, phone, image, roleLabel };
  }, [activeConv, user]);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-none sm:rounded-2xl border-0 sm:border border-slate-200 shadow-none sm:shadow-sm overflow-hidden h-full flex items-center justify-center p-8 animate-pulse">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
            <MessageSquare className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">Loading your conversations...</p>
          <p className="text-xs text-slate-400">Connecting to real-time chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-none sm:rounded-2xl border-0 sm:border border-slate-200/90 shadow-none sm:shadow-sm overflow-hidden h-full flex flex-col sm:flex-row w-full relative">
      {/* ======================================================== */}
      {/* 1. Conversations List Sidebar (Left pane)                */}
      {/* ======================================================== */}
      <div
        className={`w-full sm:w-80 md:w-96 border-r border-slate-200 flex flex-col bg-slate-50/70 transition-all duration-200 ${
          mobileView === "thread" ? "hidden sm:flex" : "flex"
        }`}
      >
        {/* Header & Search */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </span>
              Messages
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {conversations.length}
              </span>
            </h3>

            {/* Overall Unread Count Indicator */}
            {conversations.reduce((sum, c) => sum + (c._count?.messages || 0), 0) > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 animate-pulse">
                {conversations.reduce((sum, c) => sum + (c._count?.messages || 0), 0)} new
              </span>
            )}
          </div>

          {/* Quick Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search chats or tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Scrollable Conversation Cards */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/90 overscroll-contain">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-2 my-auto">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">No conversations found</p>
              <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                {searchQuery
                  ? "No matching messages or names."
                  : "Chats open automatically when an application is sent or accepted."}
              </p>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const otherPartyName =
                user?.role === "WORKER"
                  ? c.employer?.employerProfile?.businessName || c.employer?.name
                  : c.worker?.name;

              const otherPartyImage =
                user?.role === "WORKER"
                  ? c.employer?.employerProfile?.shopImage || c.employer?.profileImage
                  : c.worker?.profileImage;

              const isActive = c.id === activeConvId;
              const lastMsg = c.messages?.[0];
              const unreadCount = c._count?.messages || 0;

              return (
                <button
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`w-full p-3.5 sm:p-4 text-left transition flex items-start gap-3 relative select-none ${
                    isActive
                      ? "bg-brand-50/90 border-l-4 border-brand-600 sm:border-l-4"
                      : "hover:bg-slate-100/70 bg-white/40"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {otherPartyImage ? (
                      <img
                        src={otherPartyImage}
                        alt={otherPartyName || "User"}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {otherPartyName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white text-white text-[9px] font-black rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {otherPartyName}
                      </span>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    {/* Task Title Tag */}
                    <p className="text-[11px] text-brand-700 font-bold truncate mt-0.5 flex items-center gap-1">
                      <Briefcase className="w-2.5 h-2.5 shrink-0" />
                      <span>{c.job?.title || "Local Gig"}</span>
                    </p>

                    {/* Last message preview */}
                    {lastMsg ? (
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          unreadCount > 0 ? "font-bold text-slate-800" : "text-slate-500"
                        }`}
                      >
                        {lastMsg.senderId === user?.id ? "You: " : ""}
                        {lastMsg.message}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic mt-0.5">Start conversation...</p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. Messages Thread (Right pane / Full Screen on Mobile) */}
      {/* ======================================================== */}
      <div
        className={`flex-1 flex flex-col bg-white h-full overflow-hidden transition-all duration-200 ${
          mobileView === "list" ? "hidden sm:flex" : "flex"
        }`}
      >
        {activeConv ? (
          <>
            {/* Thread Header */}
            <div className="px-3 sm:px-6 py-3 border-b border-slate-200/90 flex items-center justify-between bg-white shrink-0 shadow-xs z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className="sm:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition shrink-0 -ml-1 active:scale-95"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Avatar */}
                <div className="relative shrink-0">
                  {otherPartyInfo?.image ? (
                    <img
                      src={otherPartyInfo.image}
                      alt={otherPartyInfo.name || "User"}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm">
                      {otherPartyInfo?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {otherPartyInfo?.name}
                    </h4>
                    <span className="hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {otherPartyInfo?.roleLabel}
                    </span>
                  </div>

                  <p className="text-[10px] sm:text-xs text-slate-500 truncate flex items-center gap-1 mt-0.2">
                    <Briefcase className="w-3 h-3 text-brand-600 shrink-0" />
                    <span className="truncate">Task: {activeConv.job?.title}</span>
                  </p>
                </div>
              </div>

              {/* Actions Header */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* Direct Call Button (if phone exists) */}
                {otherPartyInfo?.phone && (
                  <a
                    href={`tel:${otherPartyInfo.phone}`}
                    className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
                    title="Direct Phone Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Call</span>
                  </a>
                )}

                {/* View Job Link */}
                {activeConv.job?.id && (
                  <Link
                    href={`/jobs/${activeConv.job.id}`}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition text-xs font-medium flex items-center gap-1"
                    title="View Task Details"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Gig Info</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Message Bubble Feed */}
            <div
              ref={messageContainerRef}
              onScroll={handleScroll}
              className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3 bg-slate-50/50 overscroll-contain"
            >
              {messages.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-brand-600 flex items-center justify-center mx-auto shadow-xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">No messages yet</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Say hello or coordinate location and timings directly with {otherPartyInfo?.name}.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in fade-in duration-150`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-md p-3 sm:p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed relative ${
                          isMe
                            ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-br-xs shadow-xs"
                            : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-xs"
                        } ${m.failed ? "ring-2 ring-red-400 bg-red-600" : ""}`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.message}</p>

                        <div
                          className={`flex items-center justify-end gap-1 text-[9px] sm:text-[10px] mt-1 ${
                            isMe ? "text-brand-100" : "text-slate-400"
                          }`}
                        >
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {isMe && (
                            <span>
                              {m.isOptimistic ? (
                                <Clock className="w-2.5 h-2.5 animate-spin text-brand-200" />
                              ) : m.failed ? (
                                <span
                                  onClick={() => sendMessageText(m.message)}
                                  className="cursor-pointer text-red-200 underline font-bold flex items-center gap-0.5"
                                >
                                  <AlertCircle className="w-2.5 h-2.5" /> Retry
                                </span>
                              ) : m.isRead ? (
                                <span title="Read">
                                  <CheckCheck className="w-3 h-3 text-emerald-300" />
                                </span>
                              ) : (
                                <span title="Delivered">
                                  <Check className="w-3 h-3 text-brand-200" />
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box (Mobile-friendly sticky footer) */}
            <form
              onSubmit={handleSendMessage}
              className="p-2.5 sm:p-3.5 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0 relative z-20"
            >
              <input
                type="text"
                placeholder="Type your message here..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white focus:border-brand-500 transition"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!inputMessage.trim()}
                className="font-bold px-3.5 py-2.5 rounded-xl sm:rounded-2xl shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline ml-1.5">Send</span>
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-slate-50/40">
            <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-xs">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Your Communication Hub</h4>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Select a chat on the left to review messages, exchange contact details, and coordinate local task schedules.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
