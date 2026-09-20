"use client";

import React from "react";

interface AnimatedAuroraProps {
  className?: string;
  children?: React.ReactNode;
}

export function AnimatedAurora({ className = "", children }: AnimatedAuroraProps) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-950 text-white w-full max-w-full [contain:paint] ${className}`}
      style={{ clipPath: "inset(0)" }}
    >
      {/* 1. Deep Cosmic Aurora Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-slate-950 to-brand-950 opacity-90" />

      {/* 2. Floating Radiant Aurora Waves */}
      <div className="absolute -top-1/2 left-0 sm:left-[-10%] w-full sm:w-[120%] h-[200%] opacity-45 pointer-events-none -z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-72 sm:w-[600px] h-72 sm:h-[600px] rounded-full bg-gradient-to-tr from-brand-500/40 via-cyan-400/30 to-emerald-400/20 blur-[60px] sm:blur-[130px] animate-blob-1" />
        <div className="absolute top-[25%] right-0 sm:right-[15%] w-64 sm:w-[550px] h-64 sm:h-[550px] rounded-full bg-gradient-to-br from-indigo-500/40 via-purple-500/30 to-rose-400/20 blur-[60px] sm:blur-[130px] animate-blob-2" />
        <div className="absolute bottom-[10%] left-[10%] sm:left-[35%] w-80 sm:w-[700px] h-64 sm:h-[500px] rounded-full bg-gradient-to-t from-teal-400/30 via-emerald-500/25 to-blue-600/20 blur-[60px] sm:blur-[140px] animate-blob-3" />
      </div>

      {/* 3. Subtle Cyber Dot Matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-15 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] animate-grid-glow pointer-events-none" />

      {/* 4. Shimmering Starlight Points */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[15%] w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8] animate-pulse-slow" />
        <div className="absolute top-[45%] right-[22%] w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_10px_#34d399] animate-ping" />
        <div className="absolute bottom-[30%] left-[28%] w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#fbbf24] animate-pulse-slow" />
        <div className="absolute top-[70%] right-[35%] w-1 h-1 rounded-full bg-purple-300 shadow-[0_0_6px_#c084fc] animate-pulse" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
