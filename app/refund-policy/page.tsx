import React from "react";
import Link from "next/link";
import { RefreshCcw, ShieldCheck, CheckCircle2, Clock, HelpCircle, ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Work Adda Escrow Protection",
  description:
    "Understand Work Adda's escrow refund rules, task cancellation procedures, revision handling, and dispute resolution timelines.",
};

export default function RefundPolicyPage() {
  const lastUpdated = "September 23, 2026";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand-600 transition flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Refund Policy</span>
        </div>

        {/* Header Hero */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-800">
            <RefreshCcw className="w-4 h-4 text-cyan-600" />
            <span>Escrow Safeguards & Money-Back Guarantees</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            Because Work Adda secures all job payments in escrow prior to work commencement, your money is never at the arbitrary mercy of an unverified party. Learn how escrow releases, task cancellations, and refunds are handled.
          </p>
          <div className="text-xs text-slate-400 font-medium">
            Effective Date: {lastUpdated} • Version 2.1
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8 text-slate-700 leading-relaxed text-sm">
          {/* Section 1 - Cancellation Before Work */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">1</span>
              Cancellation Before Work Begins (100% Instant Refund)
            </h2>
            <p>
              If an employer deposits funds into escrow for a job but cancels the task before an applicant is accepted, or if the hired worker fails to respond or accept the contract:
            </p>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                100% Full Refund Guaranteed
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                The entire deposited escrow amount is refunded back to the employer's original payment method (UPI / Bank Account) with <strong>zero cancellation fees</strong> and <strong>0% penalty</strong>.
              </p>
            </div>
          </section>

          {/* Section 2 - Cancellation In Progress */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">2</span>
              Cancellation of In-Progress Tasks
            </h2>
            <p>
              Once a worker has started work on an assignment or physical shift, unilateral cancellation is restricted to protect worker effort:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Mutual Agreement:</strong> If both parties agree in in-app chat to cancel amicably, the escrow can be split proportionally to work completed, or refunded entirely if no work was viable.
              </li>
              <li>
                <strong>Worker Abandonment:</strong> If the worker abandons the assignment, misses the agreed deadline without communication, or fails to report to the job site, the employer may initiate cancellation and receive a full 100% escrow refund upon verification.
              </li>
            </ul>
          </section>

          {/* Section 3 - Revision Process */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">3</span>
              Deliverables Inspection & Revision Procedure
            </h2>
            <p>
              When a worker submits completed deliverables (such as handwritten notes, PDF files, or marks shift completion):
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
              <li>The employer has a review window to inspect the deliverables thoroughly.</li>
              <li>
                <strong>Requesting Revisions:</strong> If work does not meet agreed specifications, the employer should click <em>"Request Revision"</em> and provide specific feedback instead of disputing immediately. Workers are required to complete legitimate revisions in good faith.
              </li>
              <li>
                <strong>Satisfactory Approval:</strong> Once satisfied, the employer clicks <em>"Approve Deliverables"</em>, instantly releasing escrow to the worker.
              </li>
            </ol>
          </section>

          {/* Section 4 - Disputed Contracts */}
          <section className="space-y-3 p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
            <h2 className="text-base font-black text-amber-950 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              Disputed Contracts & Support Mediation
            </h2>
            <p className="text-xs text-amber-900 leading-relaxed">
              If an employer and worker cannot reach consensus on deliverable quality or task fulfillment:
            </p>
            <ul className="list-disc pl-5 text-xs text-amber-900 space-y-1">
              <li>Either party can click <strong>"Raise Dispute"</strong> directly from their Contract details view.</li>
              <li>Escrow funds are immediately <strong>frozen</strong> in the vault to prevent unauthorized withdrawal.</li>
              <li>A dedicated Work Adda human support specialist reviews the original task description, submitted files, timestamps, and message history within 48 hours.</li>
              <li>The mediator determines whether to issue a full refund to the employer, release full payout to the worker, or execute a partial pro-rata settlement.</li>
            </ul>
          </section>

          {/* Section 5 - Refund Timelines */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">4</span>
              Refund Processing Timelines
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 block font-medium">UPI Refunds</span>
                <span className="font-bold text-sm text-slate-900 mt-0.5 block">Instant to 24 Hours</span>
                <p className="text-[11px] text-slate-500 mt-1">Direct back to the VPA / UPI handle used during payment.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 block font-medium">Net Banking & Cards</span>
                <span className="font-bold text-sm text-slate-900 mt-0.5 block">3 to 5 Business Days</span>
                <p className="text-[11px] text-slate-500 mt-1">Processed automatically via Razorpay banking network.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 block font-medium">Platform Fee Refund</span>
                <span className="font-bold text-sm text-emerald-700 mt-0.5 block">100% (₹0 Retained)</span>
                <p className="text-[11px] text-slate-500 mt-1">No cancellation fee or administrative retention deducted.</p>
              </div>
            </div>
          </section>

          {/* Section 6 - Need Help */}
          <section className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              Need Assistance with a Refund or Contract?
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              If your refund is delayed or if you have questions regarding an ongoing escrow hold, our regional support desk is available to assist you:
            </p>
            <div className="text-xs text-slate-700 pt-1 space-y-1">
              <div><strong>Email:</strong> support@workadda.com (Subject: <em>Escrow Refund Inquiry</em>)</div>
              <div><strong>Helpline:</strong> +91 98765 00000 (Mon – Sat, 9:00 AM – 7:00 PM IST)</div>
              <div><strong>Operational Hub:</strong> Fatehabad / Hisar, Haryana, India</div>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-center gap-6 text-xs font-bold text-brand-600">
          <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/contact" className="hover:underline">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
