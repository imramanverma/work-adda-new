"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ui/toast";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Receipt,
  FileText,
  RefreshCw,
  Smartphone,
  Copy,
  Check,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    payments: any[];
    disputes: any[];
    auditLogs: any[];
    vaultStats: any;
  }>({
    payments: [],
    disputes: [],
    auditLogs: [],
    vaultStats: {
      totalGrossVolume: 0,
      totalEscrowHeld: 0,
      totalReleased: 0,
      totalRefunded: 0,
      totalPlatformFee: 0,
      activeDisputesCount: 0,
      totalTransactions: 0,
    },
  });

  const [activeTab, setActiveTab] = useState<"upi" | "disputes" | "ledger" | "audit">("upi");

  // Dispute resolution modal state
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  const [resolutionAction, setResolutionAction] = useState<string>("RELEASE_TO_WORKER");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolving, setResolving] = useState(false);

  // Direct UPI approval state
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingPayment, setRejectingPayment] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payments");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        toast.error("Error", "Failed to load admin payment vault.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;

    setResolving(true);
    try {
      const res = await fetch("/api/disputes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disputeId: selectedDispute.id,
          resolution: resolutionAction,
          notes: resolutionNotes,
        }),
      });

      const resJson = await res.json();
      if (res.ok) {
        toast.success("Dispute Resolved! ✔️", resJson.message);
        setSelectedDispute(null);
        setResolutionNotes("");
        fetchAdminData();
      } else {
        toast.error("Resolution Failed", resJson.error || "Could not resolve dispute.");
      }
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setResolving(false);
    }
  };

  // Filter Direct UPI payments
  const upiPayments = useMemo(() => {
    return (data.payments || []).filter((p) => {
      if (p.paymentMethod === "DIRECT_UPI") return true;
      try {
        if (p.metadata && p.metadata.includes("DIRECT_UPI")) return true;
      } catch {}
      return false;
    });
  }, [data.payments]);

  const pendingUpiPayments = useMemo(() => {
    return upiPayments.filter(
      (p) => p.status === "PAYMENT_PENDING" || p.escrowStatus === "PENDING"
    );
  }, [upiPayments]);

  const parseUpiMetadata = (metadataStr: string | null) => {
    if (!metadataStr) return {};
    try {
      return JSON.parse(metadataStr);
    } catch {
      return {};
    }
  };

  const handleApproveUtr = async (paymentId: string) => {
    setActionInProgressId(paymentId);
    try {
      const res = await fetch("/api/admin/payments/approve-utr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, action: "APPROVE" }),
      });
      const resJson = await res.json();
      if (res.ok) {
        toast.success("UPI Payment Approved! ✅", "Funds locked in Escrow. Worker has been notified.");
        fetchAdminData();
      } else {
        toast.error("Approval Failed", resJson.error || "Could not approve payment.");
      }
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPayment) return;
    setActionInProgressId(rejectingPayment.id);
    try {
      const res = await fetch("/api/admin/payments/approve-utr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: rejectingPayment.id,
          action: "REJECT",
          rejectionReason,
        }),
      });
      const resJson = await res.json();
      if (res.ok) {
        toast.success("Payment Rejected", "Payer has been notified.");
        setRejectModalOpen(false);
        setRejectingPayment(null);
        setRejectionReason("");
        fetchAdminData();
      } else {
        toast.error("Reject Failed", resJson.error || "Could not reject payment.");
      }
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    toast.success("Copied! 📋", `UTR ${utr} copied to clipboard.`);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const stats = data.vaultStats || {};

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Admin Escrow Vault & Dispute Resolution
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Oversee platform escrow balances, arbitrate open worker-employer disputes, and review audit logs.
            </p>
          </div>

          <Button size="sm" variant="outline" onClick={fetchAdminData} isLoading={loading}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh Vault
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Escrow Held
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-black text-blue-600">
                {formatCurrency(stats.totalEscrowHeld || 0)}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Secured in platform vault</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Released Payouts
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-black text-emerald-600">
                {formatCurrency(stats.totalReleased || 0)}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Successfully settled to workers</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Refunded
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-black text-slate-700">
                {formatCurrency(stats.totalRefunded || 0)}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Returned to hirers</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Disputes
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-black text-red-600">
                {stats.activeDisputesCount || 0}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting admin arbitration</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <Button
            size="sm"
            variant={activeTab === "upi" ? "primary" : "ghost"}
            onClick={() => setActiveTab("upi")}
            className="font-bold relative shrink-0"
          >
            <Smartphone className="w-4 h-4 mr-1.5" />
            Direct UPI Queue
            {pendingUpiPayments.length > 0 ? (
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                {pendingUpiPayments.length} Pending
              </span>
            ) : (
              <span className="ml-1.5 text-xs text-slate-400">({upiPayments.length})</span>
            )}
          </Button>

          <Button
            size="sm"
            variant={activeTab === "disputes" ? "primary" : "ghost"}
            onClick={() => setActiveTab("disputes")}
            className="font-bold shrink-0"
          >
            <AlertTriangle className="w-4 h-4 mr-1.5" />
            Dispute Arbitration ({data.disputes?.length || 0})
          </Button>

          <Button
            size="sm"
            variant={activeTab === "ledger" ? "primary" : "ghost"}
            onClick={() => setActiveTab("ledger")}
            className="font-bold shrink-0"
          >
            <Receipt className="w-4 h-4 mr-1.5" />
            Escrow Ledger ({data.payments?.length || 0})
          </Button>

          <Button
            size="sm"
            variant={activeTab === "audit" ? "primary" : "ghost"}
            onClick={() => setActiveTab("audit")}
            className="font-bold shrink-0"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Audit Trail ({data.auditLogs?.length || 0})
          </Button>
        </div>

        {/* TAB 0: DIRECT UPI PAYMENTS & UTR APPROVALS */}
        {activeTab === "upi" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">
                    Direct UPI Payments & UTR Approvals
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                    0% Razorpay Fee
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify 12-digit UTR numbers against your UPI bank app (GPay / PhonePe / Paytm / YONO) and approve with 1 click.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  Pending Verification:{" "}
                  <strong className="text-amber-600 font-bold">
                    {pendingUpiPayments.length}
                  </strong>
                </span>
              </div>
            </div>

            {upiPayments.length === 0 ? (
              <div className="p-12 text-center">
                <Smartphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">No Direct UPI payments yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  When hirers submit payments with their 12-digit UPI UTR, they will appear here instantly for 1-click verification.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5">Submission Date</th>
                      <th className="px-6 py-3.5">Work Contract & Hirer</th>
                      <th className="px-6 py-3.5">Assigned Worker</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">12-Digit UTR / Ref ID</th>
                      <th className="px-6 py-3.5">Verification Status</th>
                      <th className="px-6 py-3.5 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {upiPayments.map((p) => {
                      const meta = parseUpiMetadata(p.metadata);
                      const utr = meta.utrNumber || "N/A";
                      const isPending =
                        p.status === "PAYMENT_PENDING" || p.escrowStatus === "PENDING";
                      const isHeld =
                        p.status === "HELD" || p.escrowStatus === "HELD";
                      const isFailed = p.status === "FAILED";

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                            <p className="font-medium text-slate-900">{formatDate(p.createdAt)}</p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(p.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900 line-clamp-1 max-w-[200px]">
                              {p.job?.title || "Direct Payment"}
                            </p>
                            <p className="text-slate-500 text-[11px]">
                              Hirer: <span className="font-medium text-slate-700">{p.payer?.name}</span> ({p.payer?.phone})
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800">{p.receiver?.name || "Unassigned"}</p>
                            <p className="text-[11px] text-slate-400">{p.receiver?.phone || ""}</p>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-black text-emerald-700 text-sm">
                              {formatCurrency(p.amount)}
                            </span>
                            <p className="text-[10px] text-emerald-600 font-medium">0% gateway fee</p>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <code className="px-2 py-1 bg-slate-100 text-slate-900 rounded font-mono font-bold text-xs border border-slate-200">
                                {utr}
                              </code>
                              {utr !== "N/A" && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyUtr(utr)}
                                  title="Copy UTR"
                                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                                >
                                  {copiedUtr === utr ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                            {meta.payerVpa && (
                              <p className="text-[10px] text-slate-400 mt-0.5">VPA: {meta.payerVpa}</p>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {isPending && (
                              <Badge variant="warning" className="animate-pulse">
                                Pending Approval
                              </Badge>
                            )}
                            {isHeld && (
                              <Badge variant="success" className="flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Locked in Escrow
                              </Badge>
                            )}
                            {isFailed && (
                              <Badge variant="danger">
                                Rejected / Failed
                              </Badge>
                            )}
                            {!isPending && !isHeld && !isFailed && (
                              <Badge variant="default">{p.status}</Badge>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveUtr(p.id)}
                                  isLoading={actionInProgressId === p.id}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm py-1 px-2.5"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  Approve & Hold
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={actionInProgressId === p.id}
                                  onClick={() => {
                                    setRejectingPayment(p);
                                    setRejectModalOpen(true);
                                  }}
                                  className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs py-1 px-2.5"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : isHeld ? (
                              <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-end gap-1">
                                <Check className="w-3.5 h-3.5" /> Reconciled
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">Closed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: DISPUTES */}
        {activeTab === "disputes" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Dispute Arbitration Center</h3>
              <p className="text-xs text-slate-500">
                Review complaints, inspect contract details, and exercise binding release or refund resolution.
              </p>
            </div>

            {data.disputes.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No open disputes! All escrow accounts healthy.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5">Date Raised</th>
                      <th className="px-6 py-3.5">Contract</th>
                      <th className="px-6 py-3.5">Raised By</th>
                      <th className="px-6 py-3.5">Reason & Description</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Arbitration Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {data.disputes.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                          {formatDate(d.createdAt)}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">
                          {d.job?.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold">{d.raisedBy?.name}</span>
                          <span className="block text-[10px] text-slate-400 uppercase">
                            {d.raisedBy?.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-sm">
                          <p className="font-bold text-slate-900">{d.reason}</p>
                          <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">
                            {d.description}
                          </p>
                          {d.resolution && (
                            <p className="text-emerald-600 font-bold text-[10px] mt-1">
                              {d.resolution}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {formatCurrency(d.payment?.amount || 0)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              d.status === "OPEN"
                                ? "destructive"
                                : d.status === "RESOLVED"
                                ? "success"
                                : "outline"
                            }
                            className="font-bold"
                          >
                            {d.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {d.status === "OPEN" ? (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => setSelectedDispute(d)}
                              className="font-bold bg-brand-600 hover:bg-brand-700"
                            >
                              Arbitrate
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">Settled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ESCROW LEDGER */}
        {activeTab === "ledger" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Full Platform Escrow Ledger</h3>
              <p className="text-xs text-slate-500">Every Razorpay order, held amount, and settlement status</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Created</th>
                    <th className="px-6 py-3.5">Job Title</th>
                    <th className="px-6 py-3.5">Payer (Hirer)</th>
                    <th className="px-6 py-3.5">Receiver (Worker)</th>
                    <th className="px-6 py-3.5">Gross Amount</th>
                    <th className="px-6 py-3.5">Escrow State</th>
                    <th className="px-6 py-3.5">Razorpay Order ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {data.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">
                        {p.job?.title}
                      </td>
                      <td className="px-6 py-4">{p.payer?.name}</td>
                      <td className="px-6 py-4">{p.receiver?.name}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            p.escrowStatus === "RELEASED"
                              ? "success"
                              : p.escrowStatus === "DISPUTED"
                              ? "destructive"
                              : p.escrowStatus === "HELD"
                              ? "brand"
                              : "outline"
                          }
                          className="font-bold"
                        >
                          {p.escrowStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-500">
                        {p.razorpayOrderId || p.transactionId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Immutable Audit Trail</h3>
              <p className="text-xs text-slate-500">Server-side cryptographic event logs for all state machine actions</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5">Event Type</th>
                    <th className="px-6 py-3.5">Actor Role</th>
                    <th className="px-6 py-3.5">State Transition</th>
                    <th className="px-6 py-3.5">Payment ID</th>
                    <th className="px-6 py-3.5">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium font-mono text-[11px]">
                  {data.auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-3 whitespace-nowrap text-slate-500">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-3 font-bold text-slate-900">{log.eventType}</td>
                      <td className="px-6 py-3">{log.actorRole || "SYSTEM"}</td>
                      <td className="px-6 py-3">
                        {log.fromStatus || "NONE"} &rarr; {log.toStatus || "NONE"}
                      </td>
                      <td className="px-6 py-3 text-slate-400">{log.paymentId?.substring(0, 10)}...</td>
                      <td className="px-6 py-3 max-w-xs truncate text-[10px] text-slate-500">
                        {log.metadata || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Dispute Arbitration */}
        <Modal
          isOpen={!!selectedDispute}
          onClose={() => setSelectedDispute(null)}
          title="Arbitrate Escrow Dispute"
          description="Execute administrative authority to release or refund funds."
        >
          {selectedDispute && (
            <form onSubmit={handleResolveDispute} className="space-y-4 text-left">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <p>
                  <strong>Contract:</strong> {selectedDispute.job?.title}
                </p>
                <p>
                  <strong>Escrow Amount:</strong>{" "}
                  <span className="font-bold text-emerald-700">
                    {formatCurrency(selectedDispute.payment?.amount || 0)}
                  </span>
                </p>
                <p>
                  <strong>Hirer:</strong> {selectedDispute.payment?.payer?.name}
                </p>
                <p>
                  <strong>Worker:</strong> {selectedDispute.payment?.receiver?.name}
                </p>
                <p>
                  <strong>Dispute Reason:</strong> {selectedDispute.reason}
                </p>
                <p className="text-slate-600">
                  <strong>Description:</strong> {selectedDispute.description}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Arbitration Decision
                </label>
                <select
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="RELEASE_TO_WORKER">
                    Release Funds to Worker (Favor Worker)
                  </option>
                  <option value="REFUND_TO_HIRER">
                    Execute Razorpay Refund to Hirer (Favor Hirer)
                  </option>
                  <option value="DISMISS_DISPUTE">
                    Dismiss Dispute (Restore HELD state)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Resolution Notes / Findings
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Summarize investigation findings and justification for this ruling..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSelectedDispute(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={resolving}
                  className="font-bold bg-brand-600 hover:bg-brand-700"
                >
                  Confirm Ruling
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* UPI Payment Rejection Modal */}
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => !actionInProgressId && setRejectModalOpen(false)}
          title="Reject UPI Payment Submission"
          description="Explain why this payment reference could not be verified in your bank account."
          maxWidth="sm"
        >
          {rejectingPayment && (
            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                <p className="font-bold text-rose-900">
                  Transaction: {formatCurrency(rejectingPayment.amount)}
                </p>
                <p className="text-rose-700">
                  UTR: {parseUpiMetadata(rejectingPayment.metadata).utrNumber || "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rejection Reason
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. UTR not found on bank statement, or amount does not match..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={Boolean(actionInProgressId)}
                  onClick={() => setRejectModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={Boolean(actionInProgressId)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Confirm Rejection
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
}
