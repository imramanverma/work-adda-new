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
import { AuthBackground } from "@/components/brand/auth-background";
import { ImageUpload } from "@/components/ui/image-upload";

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
    shopImage: "",
    profileImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!formData.phone || phoneDigits.length < 10) {
      setError(
        language === "hi"
          ? "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।"
          : "Please enter a valid 10-digit phone number."
      );
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

    // Compulsory Shop Image Validation for Employers
    if (role === "EMPLOYER" && (!formData.shopImage || !formData.shopImage.trim())) {
      setError(
        language === "hi"
          ? "नियोक्ता पंजीकरण के लिए दुकान / कार्यस्थल की तस्वीर अनिवार्य है।"
          : "Shop / Storefront image is compulsory for employer registration."
      );
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
      shopImage: role === "EMPLOYER" ? formData.shopImage : undefined,
      profileImage: role === "WORKER" ? formData.profileImage : undefined,
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === "hi" ? "मोबाइल नंबर" : "Phone Number"}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9822200001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
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
            <div className="space-y-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Compulsory Shop Image */}
              <ImageUpload
                label={language === "hi" ? "दुकान/व्यवसाय की तस्वीर" : "Shop / Storefront Image"}
                required={true}
                aspectRatio="video"
                placeholderIcon="store"
                description={
                  language === "hi"
                    ? "अपनी दुकान या कार्यस्थल की स्पष्ट तस्वीर अपलोड करें। सत्यापन के लिए यह अनिवार्य है।"
                    : "Upload a clear photo of your store, workshop, or business premises. Compulsory for employer verification."
                }
                value={formData.shopImage}
                onChange={(val) => setFormData({ ...formData, shopImage: val || "" })}
              />
            </div>
          )}

          {/* Worker Specific Fields: Optional Profile Photo */}
          {role === "WORKER" && (
            <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100">
              <ImageUpload
                label={language === "hi" ? "प्रोफ़ाइल तस्वीर" : "Worker Profile Photo"}
                required={false}
                aspectRatio="square"
                placeholderIcon="user"
                description={
                  language === "hi"
                    ? "अपनी तस्वीर अपलोड करें ताकि नियोक्ता आपको आसानी से पहचान सकें।"
                    : "Upload a photo of yourself. Helps employers recognize and trust your profile."
                }
                value={formData.profileImage}
                onChange={(val) => setFormData({ ...formData, profileImage: val || "" })}
              />
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
    </div>
  );
}
