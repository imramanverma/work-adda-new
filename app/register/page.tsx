"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import {
  Briefcase,
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { AuthBackground } from "@/components/brand/auth-background";
import { OtpVerificationModal } from "@/components/auth/otp-input";

export default function RegisterPage() {
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const [role, setRole] = useState<"WORKER" | "EMPLOYER">("WORKER");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    location: "Fatehabad",
    businessName: "",
    businessType: "Retail Shop",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const locations = [
    "Fatehabad",
    "Sirsa",
  ];

  const businessTypes = [
    "Retail Shop",
    "Logistics & Delivery",
    "Cafe & Restaurant",
    "Events & Catering",
    "Warehouse & Wholesale",
    "IT & Tech Startup",
    "Healthcare / Clinic",
    "Repair & Workshop",
    "Individual / Household",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPhoneVerified) {
      if (!formData.phone || formData.phone.length < 10) {
        setError(
          language === "hi"
            ? "कृपया पंजीकरण से पहले 10 अंकों का वैध मोबाइल नंबर दर्ज करें।"
            : "Please enter a valid 10-digit phone number first."
        );
        return;
      }
      setShowOtpModal(true);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(language === "hi" ? "पासवर्ड मेल नहीं खाते" : "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError(language === "hi" ? "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए" : "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const res = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role,
      location: formData.location,
      businessName: role === "EMPLOYER" ? formData.businessName : undefined,
      businessType: role === "EMPLOYER" ? formData.businessType : undefined,
    });

    if (!res.success && res.error) {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/60 relative overflow-hidden">
      {/* Beautiful Animated Background */}
      <AuthBackground />

      <div className="max-w-xl w-full space-y-8 bg-white/92 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/80 shadow-2xl shadow-brand-900/10 relative z-10">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {language === "hi" ? "वर्क अड्डा से जुड़ें" : "Join Work Adda"}
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            {language === "hi"
              ? "शुरू करने के लिए अपना खाता प्रकार चुनें"
              : "Choose your account type to get started"}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setRole("WORKER")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${
              role === "WORKER"
                ? "bg-white text-brand-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-4 h-4" />{" "}
            {language === "hi" ? "काम खोजना चाहते हैं (वर्कर)" : "I Want to Work / Gig"}
          </button>
          <button
            type="button"
            onClick={() => setRole("EMPLOYER")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${
              role === "EMPLOYER"
                ? "bg-white text-brand-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4" />{" "}
            {language === "hi" ? "कामगार रखना चाहते हैं (नियोक्ता)" : "I Want to Hire"}
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Jaspreet Singh"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  {language === "hi" ? "मोबाइल नंबर" : "Phone Number"}
                </label>
                {isPhoneVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t("otp.verified_badge")}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (isPhoneVerified) setIsPhoneVerified(false);
                  }}
                  placeholder="e.g. 9822200001"
                  className={`w-full pl-3.5 ${
                    isPhoneVerified ? "pr-10 border-emerald-400 bg-emerald-50/20" : "pr-24 border-slate-200"
                  } py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500`}
                />
                {!isPhoneVerified && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.phone || formData.phone.length < 10) {
                        setError(
                          language === "hi"
                            ? "कृपया पहले मान्य 10 अंकों का मोबाइल नंबर दर्ज करें"
                            : "Please enter a valid 10-digit phone number first"
                        );
                        return;
                      }
                      setError("");
                      setShowOtpModal(true);
                    }}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 rounded-lg text-xs font-bold transition shadow-xs flex items-center"
                  >
                    {t("otp.send_btn")}
                  </button>
                )}
                {isPhoneVerified && (
                  <div className="absolute right-3 top-3 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1.5 leading-tight">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                {t("otp.privacy_notice")}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. jaspreet@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Employer Specific Fields */}
          {role === "EMPLOYER" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g. Singh Retail Supermarket"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Category</label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {businessTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">City / Primary Location</label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Repeat password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              By signing up, you agree to Work Adda's community guidelines, verified task policies, and 5% platform escrow terms.
            </span>
          </div>

          <Button type="submit" isLoading={loading} className="w-full font-bold">
            {language === "hi" ? "खाता बनाएं" : "Create Account"}{" "}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            {language === "hi" ? "पहले से खाता है?" : "Already have an account?"}{" "}
            <Link href="/login" className="font-bold text-brand-600 hover:text-brand-700">
              {language === "hi" ? "लॉग इन करें" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>

      {/* OTP Phone Verification Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title={t("otp.verify_title")}
        description={t("otp.verify_desc")}
      >
        <OtpVerificationModal
          phone={formData.phone}
          purpose="REGISTER"
          onVerified={() => {
            setIsPhoneVerified(true);
            setShowOtpModal(false);
          }}
          onCancel={() => setShowOtpModal(false)}
        />
      </Modal>
    </div>
  );
}
