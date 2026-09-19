"use client";

import React from "react";
import { Sparkles, MapPin, Zap, CheckCircle2, Star, Building2, Package, ShieldCheck } from "lucide-react";

export function AuthBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none -z-10">
      {/* 1. Subtle Dot Grid Background Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      {/* 2. Large Animated Ambient Glow Orbs */}
      <div className="absolute -top-36 -left-36 w-[450px] h-[450px] bg-gradient-to-tr from-brand-600/25 via-blue-500/20 to-indigo-500/15 rounded-full blur-[100px] animate-float-slow" />
      <div className="absolute -bottom-36 -right-36 w-[450px] h-[450px] bg-gradient-to-tr from-amber-500/25 via-orange-500/20 to-rose-500/15 rounded-full blur-[100px] animate-float-delayed" />
      <div className="absolute top-1/3 -right-28 w-80 h-80 bg-emerald-500/15 rounded-full blur-[90px] animate-pulse" />
      <div className="absolute bottom-1/4 -left-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-[90px] animate-float-slow" />

      {/* 3. Constellation & Connected Network Lines (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="lineGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {/* Subtle connecting lines between city hubs */}
        <line x1="10%" y1="20%" x2="35%" y2="40%" stroke="url(#lineGrad1)" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="85%" y1="25%" x2="65%" y2="50%" stroke="url(#lineGrad2)" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="20%" y1="80%" x2="40%" y2="60%" stroke="url(#lineGrad2)" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="80%" y1="75%" x2="60%" y2="60%" stroke="url(#lineGrad1)" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>

      {/* 4. Floating Hyperlocal Capability Badges */}
      {/* Top-Left Floating Badge: Instant UPI Settlement */}
      <div className="hidden md:flex absolute top-16 left-8 xl:left-24 z-0 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-blue-200/70 shadow-lg shadow-blue-500/5 items-center gap-3 animate-float-slow">
        <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-600 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-brand-600" />
        </div>
        <div>
          <span className="font-extrabold text-xs text-slate-800 block">Secure Escrow</span>
          <span className="text-[10px] text-emerald-600 font-bold">Direct UPI Payouts</span>
        </div>
      </div>

      {/* Top-Right Floating Badge: Delivery Gigs */}
      <div className="hidden md:flex absolute top-20 right-8 xl:right-28 z-0 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-200/70 shadow-lg shadow-emerald-500/5 items-center gap-3 animate-float-delayed">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <span className="font-extrabold text-xs text-slate-800 block">Verified Identity</span>
          <span className="text-[10px] text-slate-500 font-medium">Mobile OTP Protected</span>
        </div>
      </div>

      {/* Bottom-Left Floating Badge: Worker Reputation */}
      <div className="hidden lg:flex absolute bottom-24 left-12 xl:left-28 z-0 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-200/70 shadow-lg shadow-amber-500/5 items-center gap-3 animate-float-delayed">
        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        </div>
        <div>
          <span className="font-extrabold text-xs text-slate-800 block">Task Reviews</span>
          <span className="text-[10px] text-amber-600 font-bold">Verified Community Ratings</span>
        </div>
      </div>

      {/* Bottom-Right Floating Badge: Proximity Matching */}
      <div className="hidden md:flex absolute bottom-20 right-10 xl:right-24 z-0 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-brand-200/70 shadow-lg shadow-brand-500/5 items-center gap-3 animate-float-slow">
        <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-brand-600" />
        </div>
        <div>
          <span className="font-extrabold text-xs text-slate-800 block">Hyperlocal Radius</span>
          <span className="text-[10px] text-brand-600 font-bold">Fatehabad, Sirsa & Hisar, Haryana</span>
        </div>
      </div>

      {/* Subtle floating glow dots */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-brand-400 blur-[1px] animate-ping" />
      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-accent-400 blur-[1px] animate-ping" />
    </div>
  );
}
