"use client";

import React from "react";
import { useLanguage } from "@/context/language-context";
import { Languages } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "pill" | "minimal";
}

export function LanguageSwitcher({ className = "", variant = "pill" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === "minimal") {
    return (
      <button
        onClick={() => setLanguage(language === "en" ? "hi" : "en")}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition ${className}`}
        title={language === "en" ? "Switch to Hindi (हिंदी)" : "Switch to English"}
        aria-label="Change Language"
      >
        <Languages className="w-4 h-4 text-brand-600" />
        <span>{language === "en" ? "हिंदी" : "English"}</span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-2xs text-xs font-semibold ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 rounded-full text-[11px] transition ${
          language === "en"
            ? "bg-white text-brand-700 font-bold shadow-xs border border-slate-200/60"
            : "text-slate-500 hover:text-slate-900 font-medium"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage("hi")}
        className={`px-2.5 py-1 rounded-full text-[11px] transition ${
          language === "hi"
            ? "bg-brand-600 text-white font-bold shadow-xs"
            : "text-slate-500 hover:text-slate-900 font-medium"
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}
