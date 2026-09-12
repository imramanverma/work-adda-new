"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
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
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(identifier, password);
    setLoading(false);
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/60 relative overflow-hidden">
      {/* Beautiful Animated Background */}
      <AuthBackground />

      <div className="max-w-md w-full space-y-7 bg-white/90 backdrop-blur-xl p-8 sm:p-9 rounded-3xl border border-white/80 shadow-2xl shadow-brand-900/10 relative z-10">
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

        {/* Password Sign-In Form (Accepts Email or Phone Number + Password) */}
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full font-bold">
            {t("auth.sign_in_btn")} <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            {t("auth.no_account")}{" "}
            <Link href="/register" className="font-bold text-brand-600 hover:text-brand-700">
              {t("auth.create_one")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
