"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/components/ui/toast";
import {
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthBackground } from "@/components/brand/auth-background";

export default function LoginPage() {
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const toast = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Initialize Google One Tap if NEXT_PUBLIC_GOOGLE_CLIENT_ID is provided
  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) return;

    const initOneTap = () => {
      if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: { credential: string }) => {
              setGoogleLoading(true);
              try {
                const res = await fetch("/api/auth/google/onetap", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ credential: response.credential }),
                });
                const data = await res.json();
                if (data.success) {
                  toast.success(
                    language === "hi" ? "साइन इन सफल! 🎉" : "Signed In! 🎉",
                    language === "hi"
                      ? `सफलतापूर्वक ${data.user.name} के रूप में साइन इन किया`
                      : `Welcome back, ${data.user.name}`
                  );
                  router.push(data.redirectUrl || "/worker/dashboard");
                } else {
                  toast.error("Google Sign-In Error", data.error || "Failed to sign in");
                }
              } catch {
                toast.error("Google Sign-In Error", "Network error during Google Sign-In");
              } finally {
                setGoogleLoading(false);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          (window as any).google.accounts.id.prompt();
        } catch (e) {
          console.error("Google Identity Services error:", e);
        }
      }
    };

    if ((window as any).google?.accounts?.id) {
      initOneTap();
    } else {
      const interval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          initOneTap();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [language, router, toast]);

  // Check URL error params on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err) {
        window.history.replaceState({}, "", "/login");
        if (err === "access_denied") {
          toast.info(
            language === "hi" ? "गूगल साइन-इन" : "Google Sign-In",
            language === "hi" ? "साइन-इन रद्द कर दिया गया।" : "Sign-in was cancelled."
          );
        } else if (err === "google_not_configured") {
          toast.error(
            language === "hi" ? "गूगल साइन-इन" : "Google Sign-In",
            language === "hi"
              ? "डिवाइस के जीमेल खाते दिखाने के लिए Google Client ID कॉन्फ़िगर करें।"
              : "Google OAuth requires GOOGLE_CLIENT_ID to be configured."
          );
        } else {
          toast.error("Google Sign-In Error", decodeURIComponent(err));
        }
      }
    }
  }, [toast, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(identifier, password);
    setLoading(false);
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/60 relative overflow-hidden">
      {/* Beautiful Animated Background */}
      <AuthBackground />

      <div className="max-w-md w-full space-y-6 bg-white/90 backdrop-blur-xl p-5 sm:p-9 rounded-3xl border border-white/80 shadow-2xl shadow-brand-900/10 relative z-10">
        <div className="text-center">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25 mb-3 p-0.5">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-accent-300" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t("auth.welcome_back")}
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            {t("auth.welcome_desc")}
          </p>
        </div>

        {/* 1. Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-2xl text-sm font-bold text-slate-700 shadow-xs hover:shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-slate-300 border-t-brand-600 rounded-full animate-spin" />
          ) : (
            <svg
              className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>{t("auth.continue_with_google")}</span>
        </button>

        {/* 2. Visual Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative px-3 bg-white/90 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
            {t("auth.or_divider")}
          </div>
        </div>

        {/* 3. Password Sign-In Form (Accepts Email or Phone Number + Password) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t("auth.email_phone")}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. worker@workadda.com or 9822200001"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t("auth.password")}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full font-bold">
            {t("auth.sign_in_btn")} <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="text-center pt-1">
          <p className="text-xs text-slate-500">
            {t("auth.no_account")}{" "}
            <Link
              href="/register"
              className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
            >
              {t("auth.create_one")}
            </Link>
          </p>
        </div>
      </div>

      {/* Google Identity Services Script for Device Gmail Account Picker */}
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
    </div>
  );
}
