import React from "react";
import Link from "next/link";
import { FileText, ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Work Adda — Local Gig & Task Marketplace",
  description:
    "Review Work Adda's platform usage rules, ₹0 platform fee model, escrow safeguards, worker/employer obligations, and academic integrity policies.",
};

export default function TermsPage() {
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
          <span className="text-slate-900 font-bold">Terms & Conditions</span>
        </div>

        {/* Header Hero */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Platform Agreement & Escrow Terms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            Welcome to Work Adda. By registering, browsing, posting a task, or applying for work, you agree to abide by these legally binding terms under the laws of Haryana and India.
          </p>
          <div className="text-xs text-slate-400 font-medium">
            Effective Date: {lastUpdated} • Version 2.1
          </div>
        </div>

        {/* Terms Content */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8 text-slate-700 leading-relaxed text-sm">
          {/* 1. Platform Nature */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">1</span>
              Hyperlocal Marketplace Model
            </h2>
            <p>
              Work Adda operates an online technology platform connecting independent gig workers, ambitious students, and local businesses in Fatehabad, Sirsa, Hisar, and surrounding regions. Work Adda is not an employment agency or direct employer; workers act as independent task contractors.
            </p>
          </section>

          {/* 2. ₹0 Platform Fee Policy */}
          <section className="space-y-3 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <h2 className="text-base font-black text-emerald-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              The ₹0 Platform Fee Guarantee (100% Payout to Workers)
            </h2>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Work Adda operates on a transparent <strong>0% platform fee model (₹0 Commission)</strong>. When an employer pays ₹500 for a completed task or assignment, the worker receives the full <strong>₹500</strong> via direct UPI or bank transfer. Work Adda does not take deductions, cut percentages, or levy hidden commissions on worker payouts.
            </p>
          </section>

          {/* 3. Escrow Terms */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">2</span>
              Escrow Protection & Payment Rules
            </h2>
            <p>
              To protect both parties from payment defaults and abandoned tasks, Work Adda incorporates an escrow safeguard powered by licensed payment gateway infrastructure:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Upfront Escrow Deposit:</strong> Hirers must deposit the agreed job amount into Work Adda Escrow before work commences. Workers are advised never to begin work until the contract displays <em>"Payment Secured in Escrow"</em>.
              </li>
              <li>
                <strong>Deliverable Submission & Inspection:</strong> Upon completion, the worker submits deliverables (digital files or physical handover verification). The employer has a review window to inspect work and verify satisfaction.
              </li>
              <li>
                <strong>Release of Funds:</strong> Once the employer clicks "Approve & Release", funds are transferred instantly to the worker's verified UPI ID or bank account.
              </li>
              <li>
                <strong>Bypass Prohibition:</strong> Attempting to circumvent the platform escrow by paying cash outside Work Adda forfeits all fraud protection and is grounds for immediate account suspension.
              </li>
            </ul>
          </section>

          {/* 4. Worker Responsibilities */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">3</span>
              Worker Responsibilities
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Deliver genuine, high-quality work strictly according to the agreed instructions and deadlines.</li>
              <li>Provide accurate profile information and valid Aadhaar/phone identity verification.</li>
              <li>Complete requested revisions in good faith when submitted within the scope of the original job description.</li>
              <li>Notify the employer immediately via in-app chat if unforeseen delays arise.</li>
            </ul>
          </section>

          {/* 5. Employer Responsibilities */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">4</span>
              Employer & Hirer Responsibilities
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Provide accurate, truthful task descriptions, correct addresses, and clear expectations.</li>
              <li>Maintain a safe, lawful, and harassment-free workplace for on-site gigs and store helpers.</li>
              <li>Promptly review submitted work and release escrow without undue delay once deliverables meet specifications.</li>
              <li>Not request additional unpaid work outside the agreed contract scope.</li>
            </ul>
          </section>

          {/* 6. Academic Integrity Policy */}
          <section className="space-y-3 p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
            <h2 className="text-base font-black text-amber-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Academic Integrity & Permissible Task Policy
            </h2>
            <p className="text-xs text-amber-900 leading-relaxed">
              Work Adda supports students through legitimate academic work opportunities (e.g. notes compilation, typing, formatting, lab manual record upkeep, tutoring, PowerPoint presentations, and study mentorship). However:
            </p>
            <ul className="list-disc pl-5 text-xs text-amber-900 space-y-1">
              <li>Users are strictly prohibited from posting tasks requesting live examination assistance, cheating services, or proxy test-taking.</li>
              <li>All assignment support services are intended solely as study aids and reference compilation.</li>
              <li>Work Adda cooperates with educational institutions and reserves the right to remove any posting violating educational ethics.</li>
            </ul>
          </section>

          {/* 7. Prohibited Conduct */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">5</span>
              Prohibited Conduct
            </h2>
            <p>The following activities result in immediate termination and blacklisting:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Posting counterfeit jobs, multi-level marketing (MLM), pyramid schemes, or illegal activities.</li>
              <li>Harassment, abusive language, discrimination, or threats directed at any community member.</li>
              <li>Submitting fraudulent UPI references or creating multiple accounts to manipulate ratings.</li>
              <li>Uploading malicious software, scraped data, or defamatory content.</li>
            </ul>
          </section>

          {/* 8. Dispute Resolution & Jurisdiction */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">6</span>
              Dispute Resolution & Governing Law
            </h2>
            <p>
              In the event of disagreement regarding deliverables or payments, either party may raise a dispute through the platform. Work Adda mediators will impartially review chat records, timestamps, and submitted files to allocate escrow funds equitably.
            </p>
            <p className="text-xs text-slate-500">
              These Terms are governed by and construed in accordance with the laws of India. Any legal proceedings arising out of or in connection with Work Adda shall be subject to the exclusive jurisdiction of the competent courts in Fatehabad / Hisar, Haryana, India.
            </p>
          </section>
        </div>

        {/* Related Links */}
        <div className="flex justify-center gap-6 text-xs font-bold text-brand-600">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/refund-policy" className="hover:underline">Refund Policy</Link>
          <span>•</span>
          <Link href="/contact" className="hover:underline">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
