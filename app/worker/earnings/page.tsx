"use client";

import React, { useState, useEffect } from "react";
import {
  IndianRupee,
  TrendingUp,
  ShieldCheck,
  Clock,
  Lock,
  Receipt,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function WorkerEarningsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalEarned: 0,
    totalHeldInEscrow: 0,
    totalDisputed: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEarnings() {
      try {
        const res = await fetch("/api/payments");
        if (res.ok) {
          const data = await res.json();
          setPayments(data.payments || []);
          setStats(
            data.stats || {
              totalEarned: 0,
              totalHeldInEscrow: 0,
              totalDisputed: 0,
              totalTransactions: 0,
            }
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadEarnings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Earnings & Escrow Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time tracking of released payouts and funds currently secured in Work Adda Escrow.
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Disbursed / Available Earnings
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-black text-emerald-600">
                {formatCurrency(stats.totalEarned || 0)}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Completed and released payouts</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Protected in Active Escrow
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-black text-blue-600">
                {formatCurrency(stats.totalHeldInEscrow || 0)}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Deposited by hirers for in-progress work</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Work Adda Platform Fee Policy
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-black text-emerald-700">0.0%</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Special ₹0 launch platform fee for all workers</p>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Escrow Transaction Ledger</h3>
              <p className="text-xs text-slate-500">Official banking transaction and escrow release records</p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading ledger...</div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No payment records yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Date & Ref</th>
                    <th className="px-6 py-3.5">Job / Task</th>
                    <th className="px-6 py-3.5">Employer</th>
                    <th className="px-6 py-3.5">Gross Amount</th>
                    <th className="px-6 py-3.5">Worker Payout</th>
                    <th className="px-6 py-3.5">Escrow Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {payments.map((p) => {
                    const isReleased = p.escrowStatus === "RELEASED" || p.escrowStatus === "SETTLED";
                    const isHeld = p.escrowStatus === "HELD" || p.escrowStatus === "RELEASE_ELIGIBLE";
                    const isDisputed = p.escrowStatus === "DISPUTED";

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                          {formatDate(p.createdAt)}
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            {p.razorpayPaymentId || p.transactionId}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">
                          {p.job?.title || "Task Assignment"}
                        </td>
                        <td className="px-6 py-4">
                          {p.payer?.employerProfile?.businessName || p.payer?.name}
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-bold">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="px-6 py-4 text-emerald-600 font-black text-sm">
                          {formatCurrency(p.workerAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              isReleased
                                ? "success"
                                : isDisputed
                                ? "destructive"
                                : isHeld
                                ? "brand"
                                : "outline"
                            }
                            className="font-bold"
                          >
                            {isReleased
                              ? "RELEASED"
                              : isDisputed
                              ? "DISPUTED"
                              : isHeld
                              ? "HELD IN ESCROW"
                              : p.escrowStatus}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
