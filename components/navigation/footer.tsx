import React from "react";
import Link from "next/link";
import { MapPin, ShieldCheck, Heart } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-12 pb-20 md:pb-12 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="mb-3">
              <Logo size="sm" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              “Local Work. Local People. Local Growth.” A trusted local employment marketplace connecting workers, students, and businesses.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-brand-600" /> Active across Fatehabad & Sirsa, Haryana
            </div>
          </div>

          {/* For Workers */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">For Workers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/jobs" className="hover:text-brand-600 transition">Find Nearby Gigs</Link></li>
              <li><Link href="/register" className="hover:text-brand-600 transition">Create Worker Profile</Link></li>
              <li><Link href="/jobs?jobType=PART_TIME" className="hover:text-brand-600 transition">Part-Time Jobs</Link></li>
              <li><Link href="/jobs?category=Delivery" className="hover:text-brand-600 transition">Delivery & Courier Tasks</Link></li>
              <li><Link href="/jobs?category=Events" className="hover:text-brand-600 transition">Event & Wedding Staff</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">For Employers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/employer/jobs/new" className="hover:text-brand-600 transition">Post a Local Job</Link></li>
              <li><Link href="/register" className="hover:text-brand-600 transition">Business Registration</Link></li>
              <li><Link href="/employer/applicants" className="hover:text-brand-600 transition">Hire Local Workers</Link></li>
              <li><Link href="/jobs?category=Retail" className="hover:text-brand-600 transition">Retail & Shop Assistants</Link></li>
              <li><Link href="/jobs?category=Logistics" className="hover:text-brand-600 transition">Warehouse Support</Link></li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">Trust & Security</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Profiles & Work Completion Escrow</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Work Adda guarantees transparent platform fee calculations (5%) with no hidden commissions.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} Work Adda Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for local community empowerment
          </div>
        </div>
      </div>
    </footer>
  );
}
