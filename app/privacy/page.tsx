import React from "react";
import Link from "next/link";
import { ShieldCheck, UserCheck, Trash2, ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Work Adda — Local Gig & Task Marketplace",
  description:
    "Learn how Work Adda collects, uses, protects, and stores user data under the Digital Personal Data Protection (DPDP) Act, 2023. Includes data deletion procedures.",
};

export default function PrivacyPolicyPage() {
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
          <span className="text-slate-900 font-bold">Privacy Policy</span>
        </div>

        {/* Header Hero */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital Personal Data Protection (DPDP) Act Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            At Work Adda (“we”, “our”, or “us”), we prioritize your privacy and are committed to safeguarding the personal data of our workers, employers, students, and businesses in Fatehabad, Sirsa, Hisar, and across Haryana, India.
          </p>
          <div className="text-xs text-slate-400 font-medium">
            Effective Date: {lastUpdated} • Version 2.1
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8 text-slate-700 leading-relaxed text-sm">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">1</span>
              Personal Data We Collect
            </h2>
            <p>
              In operating our hyperlocal marketplace, we collect personal data only when necessary to provide verified matching, escrow-protected payments, and trust in the community:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Identity & Contact Details:</strong> Full Name, verified Indian mobile phone number (via SMS OTP), email address, and voluntary profile picture or storefront photo.
              </li>
              <li>
                <strong>Hyperlocal Geographic Location:</strong> Device location (with explicit permission) or selected district (Fatehabad, Sirsa, or Hisar) to calculate task proximity within 2 km to 25 km radius.
              </li>
              <li>
                <strong>Worker Profile Information:</strong> Skills, academic interests (for tutoring and academic assignments), spoken languages, portfolio work samples, and compensation preferences.
              </li>
              <li>
                <strong>Business & Employer Information:</strong> Business or individual name, store category (e.g. Retail, Warehouse, Academic), task requirements, and workplace address.
              </li>
              <li>
                <strong>Financial & Escrow Transaction Data:</strong> Payout UPI IDs, bank transfer identifiers, Razorpay gateway transaction IDs, and escrow release status records. We <em>do not</em> store debit/credit card numbers or UPI PINs on our servers.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">2</span>
              How We Use Your Information
            </h2>
            <p>We process your data strictly under valid legal bases under the DPDP Act 2023:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-xs">Hyperlocal Matching</h3>
                <p className="text-xs text-slate-500 mt-1">Connecting neighborhood stores and students with relevant gig opportunities nearby.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-xs">Escrow & UPI Settlement</h3>
                <p className="text-xs text-slate-500 mt-1">Holding job funds safely in escrow and executing ₹0 platform fee payouts directly to worker accounts.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-xs">Fraud & Spam Prevention</h3>
                <p className="text-xs text-slate-500 mt-1">Verifying genuine local phone numbers via OTP to prevent bots and unauthorized postings.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-xs">Dispute Resolution</h3>
                <p className="text-xs text-slate-500 mt-1">Reviewing contract deliverables and communication records when mediation is requested.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">3</span>
              Phone Number Privacy & Anti-Spam Masking
            </h2>
            <p>
              Work Adda operates a built-in privacy protection layer. Your raw phone number is never displayed publicly to random internet visitors or search bots. Direct contact details are shared only between accepted contract parties to arrange handover or shift reporting.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">4</span>
              Data Sharing & Third-Party Processors
            </h2>
            <p>
              We do <strong>not</strong> sell, rent, or trade your personal data to advertisers or commercial brokers. We share data only with trusted infrastructure partners essential for service delivery:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Razorpay Software Private Limited:</strong> For secure payment gateway processing and escrow fund custody.</li>
              <li><strong>SMS Gateway Providers:</strong> For delivering 6-digit OTP verification codes.</li>
              <li><strong>Law Enforcement & Judicial Authorities:</strong> Only when strictly mandated by Indian law or judicial summons under the Information Technology Act, 2000.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs flex items-center justify-center font-bold">5</span>
              Your Rights under the DPDP Act, 2023
            </h2>
            <p>Under Indian data protection laws, you retain complete sovereignty over your information:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Right to Access:</strong> You can view all personal details stored in your profile and earnings ledger at any time.</li>
              <li><strong>Right to Correction:</strong> You can edit or update phone numbers, skills, and business details directly from your dashboard.</li>
              <li><strong>Right to Grievance Redressal:</strong> You can submit any complaint directly to our designated Grievance Officer.</li>
              <li><strong>Right to Nominate:</strong> You have the right to nominate another individual to manage your profile rights in case of death or incapacity.</li>
            </ul>
          </section>

          {/* Section 6 - Data Deletion */}
          <section className="space-y-3 p-5 rounded-2xl bg-rose-50/60 border border-rose-200">
            <h2 className="text-base font-black text-rose-950 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              How to Request Account & Data Deletion
            </h2>
            <p className="text-xs text-rose-900 leading-relaxed">
              You may request full erasure of your account, profile, uploaded photos, and historical applications at any time. To exercise your Right to Erasure:
            </p>
            <ol className="list-decimal pl-5 text-xs text-rose-900 space-y-1">
              <li>Send an email to <strong>privacy@workadda.com</strong> or <strong>support@workadda.com</strong> with the subject <em>"Account Deletion Request"</em> from your registered email address.</li>
              <li>Include your registered 10-digit mobile number for identity verification.</li>
              <li>Our technical compliance team will verify that no active escrow contracts are pending settlement, securely purge your personal records from our databases within 7 business days, and send you a formal confirmation.</li>
            </ol>
            <p className="text-[11px] text-rose-700 italic">
              Note: Certain transaction records (e.g. completed escrow payments and tax invoices) may be retained for statutory periods as mandated by Indian financial and tax laws.
            </p>
          </section>

          {/* Section 7 - Grievance Officer */}
          <section className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-600" />
              Designated Grievance Officer (IT Rules, 2021)
            </h2>
            <p className="text-xs text-slate-600">
              In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the contact details of the Grievance Officer for Work Adda are provided below:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-400 block font-medium">Officer Name</span>
                <span className="font-bold text-slate-900">Raman Kumar</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Designation</span>
                <span className="font-bold text-slate-900">Grievance & Compliance Officer</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Email Address</span>
                <span className="font-bold text-brand-600">grievance@workadda.com</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Office Location</span>
                <span className="font-bold text-slate-900">Fatehabad, Haryana - 125050, India</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
              The Grievance Officer will acknowledge any complaint within 24 hours and resolve it within 15 days from the date of receipt.
            </p>
          </section>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-4">
          <Link href="/terms" className="text-xs font-bold text-brand-600 hover:text-brand-700 underline">
            View our Terms & Conditions →
          </Link>
        </div>
      </div>
    </div>
  );
}
