"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import {
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  Phone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { AuthBackground } from "@/components/brand/auth-background";
import { OtpVerificationModal } from "@/components/auth/otp-input";

export default function LoginPage() {
  const router = useRouter();
  const { login, refreshUser } = useAuth();
  const { t, language } = useLanguage();
  const [authMode, setAuthMode] = useState<"password" | "otp">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otpPhone, setOtpPhone] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(identifier, password);
    setLoading(false);
  };

  const handleOtpLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = otpPhone.replace(/\D/g, "");
    if (!otpPhone || digits.length < 10) {
      setOtpError(
        language === "hi"
          ? "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें"
          : "Please enter a valid 10-digit mobile number"
      );
      return;
    }
    setOtpError("");
    setShowOtpModal(true);
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

        {/* Auth Mode Tabs (Password vs Mobile OTP) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setOtpError("");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
              authMode === "password"
                ? "bg-white text-brand-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {t("otp.login_tab_password")}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("otp");
              setOtpError("");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
              authMode === "otp"
                ? "bg-white text-brand-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            {t("otp.login_tab_otp")}
          </button>
        </div>

        {/* OTP Sign-In Form */}
        {authMode === "otp" ? (
          <form onSubmit={handleOtpLoginSubmit} className="space-y-4">
            {otpError && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
                {otpError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === "hi" ? "पंजीकृत मोबाइल नंबर" : "Registered Mobile Number"}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={otpPhone}
                  onChange={(e) => setOtpPhone(e.target.value)}
                  placeholder="e.g. 9822200001"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1.5 leading-tight">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                {t("otp.privacy_notice")}
              </p>
            </div>

            <Button type="submit" className="w-full font-bold">
              {t("otp.get_otp")} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        ) : (
          /* Password Sign-In Form */
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
        )}

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            {t("auth.no_account")}{" "}
            <Link href="/register" className="font-bold text-brand-600 hover:text-brand-700">
              {t("auth.create_one")}
            </Link>
          </p>
        </div>
      </div>

      {/* OTP Login Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title={t("otp.verify_title")}
        description={t("otp.verify_desc")}
      >
        <OtpVerificationModal
          phone={otpPhone}
          purpose="LOGIN"
          onVerified={async (data) => {
            setShowOtpModal(false);
            await refreshUser();
            if (data.redirectUrl) {
              router.push(data.redirectUrl);
            } else {
              router.push("/worker/dashboard");
            }
          }}
          onCancel={() => setShowOtpModal(false)}
        />
      </Modal>
    </div>
  );
}
