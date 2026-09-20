"use client";

import React from "react";

interface AnimatedBackgroundProps {
  intensity?: "subtle" | "vibrant" | "hero";
  className?: string;
  showGrid?: boolean;
  showParticles?: boolean;
}

export function AnimatedBackground({
  intensity = "subtle",
  className = "",
  showGrid = true,
  showParticles = true,
}: AnimatedBackgroundProps) {
  const opacityMap = {
    subtle: "opacity-40",
    vibrant: "opacity-60",
    hero: "opacity-75",
  };

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none -z-10 w-full max-w-full [contain:paint] ${className}`}
      style={{ clipPath: "inset(0)" }}
      aria-hidden="true"
    >
      {/* 1. Geometric Grid / Dot Matrix with Vignette Falloff */}
      {showGrid && (
        <div
          className={`absolute inset-0 bg-[radial-gradient(#94a3b8_1.2px,transparent_1.2px)] [background-size:28px_28px] ${opacityMap[intensity]} [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_80%)] animate-grid-glow`}
        />
      )}

      {/* 2. Primary Morphing Gradient Mesh Orbs */}
      <div className="absolute top-[-10%] left-[-8%] w-64 sm:w-[700px] h-64 sm:h-[700px] rounded-full bg-gradient-to-tr from-brand-500/25 via-blue-400/20 to-indigo-500/15 blur-[50px] sm:blur-[120px] animate-blob-1" />

      <div className="absolute top-[20%] right-0 sm:right-[-10%] w-60 sm:w-[650px] h-60 sm:h-[650px] rounded-full bg-gradient-to-br from-amber-400/20 via-emerald-400/15 to-teal-500/15 blur-[50px] sm:blur-[120px] animate-blob-2" />

      <div className="absolute bottom-[-15%] left-[10%] sm:left-[25%] w-72 sm:w-[750px] h-72 sm:h-[750px] rounded-full bg-gradient-to-tr from-cyan-400/20 via-sky-400/15 to-blue-600/15 blur-[55px] sm:blur-[130px] animate-blob-3" />

      <div className="absolute bottom-[20%] right-2 sm:right-[15%] w-56 sm:w-[500px] h-56 sm:h-[500px] rounded-full bg-gradient-to-tl from-purple-400/15 via-rose-300/10 to-indigo-400/15 blur-[45px] sm:blur-[110px] animate-blob-1" />

      {/* 3. Floating Micro-Stardust Particles */}
      {showParticles && (
        <div className="absolute inset-0">
          <div className="absolute top-[18%] left-[12%] w-2 h-2 rounded-full bg-brand-400/50 blur-[0.5px] animate-particle-1" />
          <div className="absolute top-[35%] right-[18%] w-2.5 h-2.5 rounded-full bg-amber-400/50 blur-[0.5px] animate-particle-2" />
          <div className="absolute top-[60%] left-[22%] w-1.5 h-1.5 rounded-full bg-emerald-400/50 blur-[0.5px] animate-particle-3" />
          <div className="absolute top-[75%] right-[25%] w-2 h-2 rounded-full bg-blue-400/50 blur-[0.5px] animate-particle-1" />
          <div className="absolute top-[48%] left-[65%] w-2 h-2 rounded-full bg-purple-400/40 blur-[0.5px] animate-particle-2" />
          <div className="absolute top-[85%] left-[45%] w-1.5 h-1.5 rounded-full bg-cyan-400/50 blur-[0.5px] animate-particle-3" />
        </div>
      )}

      {/* 4. Subtle Ambient Light Rays (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ambientRay1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="ambientRay2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#6366F1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <line
          x1="5%"
          y1="15%"
          x2="45%"
          y2="55%"
          stroke="url(#ambientRay1)"
          strokeWidth="1.2"
          strokeDasharray="6 8"
        />
        <line
          x1="95%"
          y1="20%"
          x2="55%"
          y2="60%"
          stroke="url(#ambientRay2)"
          strokeWidth="1.2"
          strokeDasharray="6 8"
        />
      </svg>
    </div>
  );
}
