import React from "react";
import Link from "next/link";
import { Users, Target, ShieldCheck, Heart, Award, MapPin, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Work Adda — Local Work. Local People. Local Growth.",
  description:
    "Learn about Work Adda's mission to empower students, gig workers, and neighborhood businesses across Fatehabad, Sirsa & Hisar, Haryana.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand-600 transition flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">About Us</span>
        </div>

        {/* Header Hero */}
        <div className="bg-white p-6 sm:p-12 rounded-3xl border border-slate-200 shadow-xs space-y-5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-bold text-brand-800">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span>Built for Fatehabad, Sirsa & Hisar, Haryana</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            “Local Work. Local People. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600">
              Local Growth.”
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Work Adda is Haryana's dedicated hyperlocal employment and task marketplace. We connect ambitious students, skilled tradespeople, and gig seekers with neighborhood shops, warehouses, and local residents — quickly, safely, and transparently.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-sm">
              ₹0
            </div>
            <h3 className="font-bold text-base text-slate-900">Zero Commission Policy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We charge 0% platform fee on worker payouts. 100% of the agreed wage goes directly into the worker's hands, supporting local prosperity.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Escrow Safeguards</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Funds are held in secure escrow powered by licensed gateway infrastructure before tasks begin, ensuring workers get paid and employers get quality work.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Verified Local Identity</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mobile OTP and profile verification protect the community from spam and bad actors, creating real neighborhood trust.
            </p>
          </div>
        </div>

        {/* Founder & Team Story */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-brand-600">The Story Behind Work Adda</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">Empowering Local Communities</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>Founded in Haryana</span>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>
              In tier-2 and tier-3 cities across Haryana like Fatehabad, Sirsa, and Hisar, finding part-time work or reliable local assistance historically relied on word-of-mouth or exploitative intermediaries who charged exorbitant cuts. Students in colleges had no safe, structured way to earn pocket money through typing, tutoring, or assignment notes. Local shop owners and traders struggled to find reliable helpers during rush hours.
            </p>
            <p>
              <strong>Work Adda was founded by Raman Kumar</strong> to solve this exact bottleneck. By building an open technology platform with zero middleman commissions, structured escrow safeguards, and Aadhaar/phone verification, we make local employment transparent, rapid, and respectable.
            </p>
          </div>

          {/* Legal Business Details Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              Legal Business Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Trade / Operating Name</span>
                <span className="font-bold text-slate-900">Work Adda Technologies</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Founder & Head of Ops</span>
                <span className="font-bold text-slate-900">Raman Kumar</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Registered Jurisdiction</span>
                <span className="font-bold text-slate-900">Fatehabad, Haryana, India</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <span>Business Registration / MSME UDYAM: <strong className="text-slate-800">UDYAM-HR-04-XXXXXXX</strong></span>
              <span>Payment Gateway Partner: <strong className="text-slate-800">Razorpay</strong></span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-600 p-8 sm:p-10 rounded-3xl text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-brand-900/10">
          <div className="space-y-2">
            <h3 className="text-2xl font-black">Ready to Join the Work Adda Network?</h3>
            <p className="text-xs sm:text-sm text-brand-100 max-w-md">
              Whether you need to earn extra income or hire verified local talent in Fatehabad, Sirsa, or Hisar, sign up in under 2 minutes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="accent" className="w-full font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-md">
                Create Free Account <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/jobs" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full font-bold bg-white/10 hover:bg-white/20 text-white border-white/30">
                Explore Gigs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
