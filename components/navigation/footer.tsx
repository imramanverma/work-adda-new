"use client";

import React from "react";
import Link from "next/link";
import { MapPin, ShieldCheck, Heart, Lock, Building2, UserCheck, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useLanguage } from "@/context/language-context";

export function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="border-t border-slate-200 bg-white pt-12 pb-20 md:pb-12 text-slate-600 text-sm w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Col 1: Brand & Legal Entity Info */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-3">
            <div>
              <Logo size="sm" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t("footer.desc")}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span>{t("brand.active_district_full")}</span>
            </div>
            {/* Legal Business Identity Box */}
            <div className="pt-2 text-[11px] text-slate-500 space-y-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Work Adda Technologies</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Regd. Enterprise • Fatehabad, Haryana, India
              </p>
              <div className="text-[10px] text-slate-400">
                UDYAM MSME: <span className="font-semibold text-slate-600">UDYAM-HR-04-XXXXXXX</span>
              </div>
            </div>
          </div>

          {/* Col 2: For Workers */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">
              {t("footer.for_workers")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/jobs" className="hover:text-brand-600 transition">
                  {language === "hi" ? "आस-पास काम खोजें" : "Find Nearby Gigs"}
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-brand-600 transition">
                  {language === "hi" ? "कामगार प्रोफाइल बनाएं" : "Create Worker Profile"}
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=Academic+%26+Assignment+Work" className="hover:text-brand-600 transition">
                  {language === "hi" ? "असाइनमेंट व नोट्स काम" : "Academic & Assignment Work"}
                </Link>
              </li>
              <li>
                <Link href="/jobs?jobType=PART_TIME" className="hover:text-brand-600 transition">
                  {language === "hi" ? "पार्ट-टाइम नौकरियां" : "Part-Time Gigs"}
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=Delivery+%26+Errands" className="hover:text-brand-600 transition">
                  {language === "hi" ? "डिलीवरी व कूरियर काम" : "Delivery & Courier Tasks"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Employers */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">
              {t("footer.for_employers")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/employer/jobs/new" className="hover:text-brand-600 transition">
                  {language === "hi" ? "लोकल काम पोस्ट करें" : "Post a Local Job"}
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-brand-600 transition">
                  {language === "hi" ? "नियोक्ता / छात्र खाता" : "Hirer Registration"}
                </Link>
              </li>
              <li>
                <Link href="/employer/applicants" className="hover:text-brand-600 transition">
                  {language === "hi" ? "स्थानीय कामगारों को रखें" : "Hire Local Workers"}
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=Local+Business+Jobs" className="hover:text-brand-600 transition">
                  {language === "hi" ? "दुकान व रीटेल सहायक" : "Retail & Store Assistants"}
                </Link>
              </li>
              <li>
                <Link href="/jobs?category=Skilled+Work" className="hover:text-brand-600 transition">
                  {language === "hi" ? "कुशल कारीगर व रिपेयर" : "Skilled Trades & Repairs"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Compliance */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">
              {language === "hi" ? "कानूनी नीतियां" : "Legal & Compliance"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-brand-600 transition flex items-center gap-1">
                  <span>Privacy Policy (DPDP Act)</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-600 transition">
                  <span>Terms & Conditions</span>
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-brand-600 transition">
                  <span>Refund & Cancellation</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-600 transition">
                  <span>About Us & Mission</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-600 transition">
                  <span>Contact Support Desk</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Trust, Safety & Payment Partners */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">
              {t("footer.trust")}
            </h4>
            <div className="space-y-2.5 text-xs">
              {/* Escrow Guarantee Pill */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Escrow Safeguard</span>
                </div>
                <p className="text-[10px] text-emerald-800 leading-tight">
                  ₹0 Platform Fee. Funds held until work is verified.
                </p>
              </div>

              {/* Payment Gateway Trust Marks */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Secured Escrow & Payouts By
                </span>
                <div className="flex items-center gap-2">
                  {/* Razorpay Trust Chip */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0C2340] text-white font-bold text-[10px] tracking-wide">
                    <span className="text-[#3395FF]">●</span> Razorpay
                  </span>
                  {/* UPI Trust Chip */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px]">
                    UPI Payouts
                  </span>
                </div>
              </div>

              {/* Grievance Link */}
              <div className="text-[11px] text-slate-500 pt-1">
                <span>IT Rules Grievance Officer: </span>
                <Link href="/contact" className="font-bold text-brand-600 hover:underline">
                  Raman Kumar
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>{t("footer.copyright")}</p>
          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/privacy" className="hover:text-brand-600 transition">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-brand-600 transition">Terms</Link>
            <span>•</span>
            <Link href="/refund-policy" className="hover:text-brand-600 transition">Refunds</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-brand-600 transition">Support</Link>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            {language === "hi" ? "निर्मित" : "Built with"}{" "}
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />{" "}
            {language === "hi" ? "स्थानीय समुदाय के सशक्तिकरण हेतु" : "for local community empowerment"}
          </div>
        </div>
      </div>
    </footer>
  );
}
