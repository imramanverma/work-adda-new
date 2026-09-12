"use client";

import React, { useState, useEffect } from "react";
import {
  IndianRupee,
  TrendingUp,
  ShieldCheck,
  Clock,
  ArrowDownRight,
  Receipt,
  Download,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function WorkerEarningsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalEarned: 0, totalTransactions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEarnings() {
      try {
        const res = await fetch("/api/payments");
        if (res.ok) {
          const data = await res.json();
          setPayments(data.payments || []);
          setStats(data.stats || { totalEarned: 0, totalTransactions: 0 });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadEarnings();
  }, []);

  const totalGross = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalFees = payments.reduce((sum, p) => sum + p.platformFee, 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Earnings & Payment Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Transparent payout breakdown with standard 5% platform fee deduction and instant settlement records.
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Net Disbursed Earnings
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-black text-emerald-600">
                {formatCurrency(stats.totalEarned || 0)}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Direct UPI / Bank transfers settled</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Gross Work Volume
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-black text-slate-900">
                {formatCurrency(totalGross)}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Across all completed tasks</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Work Adda Platform Fee (5%)
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-black text-slate-600">
                {formatCurrency(totalFees)}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Escrow, insurance & server infrastructure</p>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Transaction History</h3>
              <p className="text-xs text-slate-500">Official receipts and settlement transaction identifiers</p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading payment transactions...</div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No payment transactions recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Task / Job</th>
                    <th className="px-6 py-3.5">Payer (Employer)</th>
                    <th className="px-6 py-3.5">Gross Amount</th>
                    <th className="px-6 py-3.5">Fee (5%)</th>
                    <th className="px-6 py-3.5">Net Payout</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {payments.map((p) => {
                    const netPayout = p.amount - p.platformFee;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                          {formatDate(p.createdAt)}
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            {p.transactionId}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">
                          {p.assignment?.job?.title || "Task Assignment"}
                        </td>
                        <td className="px-6 py-4">
                          {p.payer?.employerProfile?.businessName || p.payer?.name}
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-bold">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="px-6 py-4 text-red-600">
                          -{formatCurrency(p.platformFee)}
                        </td>
                        <td className="px-6 py-4 text-emerald-600 font-black text-sm">
                          {formatCurrency(netPayout)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="success" className="font-bold">
                            {p.status}
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
