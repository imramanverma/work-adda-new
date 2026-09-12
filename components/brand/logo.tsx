import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  animated?: boolean;
  variant?: "light" | "dark";
  layout?: "horizontal" | "vertical";
  className?: string;
}

export function Logo({
  size = "md",
  showTagline = true,
  animated = false,
  variant = "light",
  layout = "horizontal",
  className,
}: LogoProps) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-4xl sm:text-5xl",
  };

  const taglineSizes = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-xs",
    xl: "text-xs sm:text-sm",
  };

  const isDark = variant === "dark";
  const isVertical = layout === "vertical";

  return (
    <div
      className={cn(
        "group select-none",
        isVertical
          ? "flex flex-col items-center text-center gap-3.5"
          : "inline-flex items-center gap-2.5",
        className
      )}
    >
      {/* Pop Emblem Icon */}
      <div
        className={cn(
          "relative rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-400 p-0.5 shadow-lg shadow-brand-500/30 transition-transform duration-300",
          iconSizes[size],
          animated && "animate-pop-in hover:scale-105"
        )}
      >
        {/* Subtle glow aura */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-400 blur-md opacity-60 -z-10 group-hover:opacity-100 transition-opacity" />

        {/* Inner Container */}
        <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center relative overflow-hidden">
          {/* Decorative background grid pattern */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/25 to-transparent" />

          {/* Custom Pop Emblem SVG */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3/4 h-3/4 relative z-10 drop-shadow-md"
          >
            {/* Connected Network Nodes */}
            <circle cx="12" cy="16" r="3.5" fill="#60A5FA" />
            <circle cx="36" cy="16" r="3.5" fill="#FBBF24" />
            <circle cx="24" cy="36" r="3.5" fill="#34D399" />

            {/* Connecting Bridges */}
            <path
              d="M12 16L24 36L36 16"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.6"
            />

            {/* Central Work Adda 'W' & 'A' Core */}
            <path
              d="M15 16L20 28L24 20L28 28L33 16"
              stroke="#FFFFFF"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Location Pin Head Peak */}
            <circle cx="24" cy="12" r="3" fill="#F59E0B" />
            <path
              d="M24 15V20"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Sparkle of Local Growth */}
            <path
              d="M24 6L25 9L28 10L25 11L24 14L23 11L20 10L23 9L24 6Z"
              fill="#FDE047"
            />
          </svg>
        </div>
      </div>

      {/* Typography */}
      <div className={cn("flex flex-col", isVertical ? "items-center text-center" : "text-left")}>
        <span
          className={cn(
            "font-black tracking-tight leading-none flex items-center gap-1",
            textSizes[size],
            isDark ? "text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]" : "text-slate-900"
          )}
        >
          {/* Work Word - Explicitly bright and luminous on dark backgrounds */}
          <span className={cn(isDark ? "text-white font-black" : "text-slate-900 font-black")}>
            Work
          </span>
          {/* Adda Word - Punchy Gradient */}
          <span
            className={cn(
              "text-transparent bg-clip-text font-black",
              isDark
                ? "bg-gradient-to-r from-brand-300 via-accent-300 to-amber-300"
                : "bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500"
            )}
          >
            Adda
          </span>
          {/* Glowing dot */}
          <span
            className={cn(
              "inline-block w-2 h-2 rounded-full ml-0.5",
              isDark
                ? "bg-accent-400 shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-pulse"
                : "bg-accent-500 animate-pulse"
            )}
          />
        </span>

        {showTagline && (
          <span
            className={cn(
              "font-bold uppercase tracking-widest mt-1 flex items-center gap-1",
              taglineSizes[size],
              isDark ? "text-slate-300" : "text-slate-600"
            )}
          >
            <span>Local Work</span>
            <span className={isDark ? "text-accent-400" : "text-accent-500"}>•</span>
            <span>Local People</span>
          </span>
        )}
      </div>
    </div>
  );
}
