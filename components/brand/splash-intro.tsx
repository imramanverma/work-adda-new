"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Sparkles, MapPin, Zap, CheckCircle2, Radio, Compass } from "lucide-react";

export function SplashIntro() {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [secondsRemaining, setSecondsRemaining] = useState(3);

  useEffect(() => {
    // Dynamic sequential phase transitions across the 3.5-second experience
    const phase2Timer = setTimeout(() => setPhase(2), 1100);
    const phase3Timer = setTimeout(() => setPhase(3), 2200);

    // Countdown interval
    const countdownInterval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    // Auto-dismiss at precisely 3.5 seconds (within user's requested 3-5s window)
    const exitTimer = setTimeout(() => {
      handleDismiss();
    }, 3500);

    return () => {
      clearTimeout(phase2Timer);
      clearTimeout(phase3Timer);
      clearInterval(countdownInterval);
      clearTimeout(exitTimer);
    };
  }, []);

  const handleDismiss = () => {
    if (fadingOut) return;
    setFadingOut(true);
    setTimeout(() => {
      setVisible(false);
    }, 450);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl transition-all duration-450 cursor-pointer select-none overflow-hidden ${
        fadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Hyperlocal Radar Ambient Waves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        {/* Sonar Radar Rings */}
        <div className="absolute w-72 h-72 rounded-full border border-brand-500/25 animate-radar-1" />
        <div className="absolute w-72 h-72 rounded-full border border-accent-400/20 animate-radar-2" />

        {/* Ambient Gradient Glows */}
        <div className="absolute w-[450px] h-[450px] bg-gradient-to-tr from-brand-600/30 via-indigo-600/20 to-accent-500/25 rounded-full blur-[110px] animate-pulse" />
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl" />
      </div>

      {/* Main Interactive Presentation Center */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex flex-col items-center text-center p-6 sm:p-8 space-y-6 max-w-md w-full mx-4"
      >
        {/* Orbital Hyperlocal City Ring around the Pop Emblem */}
        <div className="relative flex items-center justify-center">
          {/* Rotating City Beacons Orbit Ring */}
          <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-dashed border-white/20 animate-spin-slow pointer-events-none">
            {/* Top Beacon: Fatehabad */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-blue-400/60 text-[10px] font-bold text-blue-300 shadow-md shadow-blue-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              Fatehabad
            </div>
            {/* Bottom Beacon: Sirsa */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-emerald-400/60 text-[10px] font-bold text-emerald-300 shadow-md shadow-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Sirsa
            </div>
          </div>

          {/* Central Pop Emblem */}
          <div className="relative group">
            {/* Pulsing Backlight */}
            <div className="absolute -inset-2 bg-gradient-to-r from-brand-500 via-accent-400 to-emerald-400 rounded-3xl blur-xl opacity-75 animate-pulse" />

            {/* Emblem Box */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-500 p-1 shadow-2xl shadow-brand-500/40 animate-pop-in">
              <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-500/30 via-transparent to-black/60" />

                {/* Scaled Custom Emblem SVG */}
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-16 h-16 relative z-10 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                >
                  {/* Connected Community Nodes */}
                  <circle cx="12" cy="16" r="4" fill="#60A5FA" />
                  <circle cx="36" cy="16" r="4" fill="#FBBF24" />
                  <circle cx="24" cy="36" r="4" fill="#34D399" />

                  {/* Connecting Struts */}
                  <path
                    d="M12 16L24 36L36 16"
                    stroke="white"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.7"
                  />

                  {/* Central Work Adda 'W' & 'A' Monogram */}
                  <path
                    d="M15 16L20 28L24 20L28 28L33 16"
                    stroke="#FFFFFF"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Map Pin Peak */}
                  <circle cx="24" cy="11.5" r="3.2" fill="#F59E0B" />
                  <path
                    d="M24 15V20"
                    stroke="#F59E0B"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />

                  {/* Golden Sparkle of Growth */}
                  <path
                    d="M24 4.5L25.2 8L28.5 9.2L25.2 10.4L24 13.9L22.8 10.4L19.5 9.2L22.8 8L24 4.5Z"
                    fill="#FDE047"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* High-Contrast Luminous Brand Typography */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(255,255,255,0.4)]">
              Work
            </span>
            <span className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-400 drop-shadow-[0_4px_24px_rgba(245,158,11,0.4)]">
              Adda
            </span>
            <span className="inline-block w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,1)] animate-pulse" />
          </div>

          <p className="text-sm sm:text-base font-extrabold text-slate-100 tracking-wide">
            “Local Work. Local People. Local Growth.”
          </p>
        </div>

        {/* Dynamic Hyperlocal Live Status Pill (Switches with phase) */}
        <div className="h-9 flex items-center justify-center">
          {phase === 1 && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-xs font-semibold text-blue-300 animate-in fade-in duration-300">
              <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Scanning Fatehabad & Sirsa Network...</span>
            </div>
          )}
          {phase === 2 && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-xs font-semibold text-emerald-300 animate-in fade-in duration-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Hyperlocal Network • Fatehabad & Sirsa</span>
            </div>
          )}
          {phase === 3 && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-xs font-semibold text-amber-300 animate-in fade-in duration-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Ready! Instant Settlement & 5% Fee</span>
            </div>
          )}
        </div>

        {/* Fast Neon Countdown Progress Bar (3.5s linear fill) */}
        <div className="w-full max-w-xs space-y-1.5">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-brand-400 via-accent-400 to-emerald-400 rounded-full animate-shimmer" />
          </div>
        </div>

        {/* Interactive Quick Skip Button */}
        <div className="pt-1 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleDismiss}
            className="group px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs tracking-wide backdrop-blur-md shadow-lg transition-all duration-150 flex items-center gap-2 cursor-pointer hover:scale-105"
          >
            <span>Enter Marketplace</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 text-slate-300">
              {secondsRemaining}s
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
