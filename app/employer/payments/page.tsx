"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  IndianRupee,
  Receipt,
  Download,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function EmployerPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalPaid: 0, totalTransactions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await fetch("/api/payments");
        if (res.ok) {
          const data = await res.json();
          setPayments(data.payments || []);
          setStats(data.stats || { totalPaid: 0, totalTransactions: 0 });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Employer Payments & Invoices
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track all completed worker compensation payments, platform fee breakdowns, and transaction IDs.
          </p>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Disbursed Volume
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-black text-slate-900">
                {formatCurrency(stats.totalPaid || 0)}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Across {stats.totalTransactions || 0} successfully settled tasks
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Work Adda Platform Fee Policy
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-black text-brand-700">5.0%</span>
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Deducted transparently from gross payout for verification and insurance
            </p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Payment Ledger</h3>
              <p className="text-xs text-slate-500">Verified settlements and banking transaction records</p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading ledger...</div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No payments disbursed yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Task / Contract</th>
                    <th className="px-6 py-3.5">Worker Paid</th>
                    <th className="px-6 py-3.5">Gross Amount</th>
                    <th className="px-6 py-3.5">Method</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {formatDate(p.createdAt)}
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                          {p.transactionId}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">
                        {p.assignment?.job?.title || "Contract"}
                      </td>
                      <td className="px-6 py-4">{p.receiver?.name}</td>
                      <td className="px-6 py-4 text-slate-900 font-bold">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-6 py-4">{p.paymentMethod}</td>
                      <td className="px-6 py-4">
                        <Badge variant="success" className="font-bold">
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
