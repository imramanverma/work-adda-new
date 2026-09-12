"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import {
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  Users,
  ShieldCheck,
  ArrowLeft,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewJobPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Delivery",
    jobType: "PART_TIME",
    location: "Chandigarh",
    payAmount: 700,
    payType: "DAILY",
    workersRequired: 1,
    startDate: "",
    endDate: "",
    safetyConfirmed: false,
  });

  const [requiredSkills, setRequiredSkills] = useState<string[]>(["Customer Service"]);
  const [newSkill, setNewSkill] = useState("");

  const categories = [
    "Delivery",
    "Retail",
    "Logistics",
    "Hospitality",
    "Events",
    "Office Assistance",
    "Data Entry",
    "Sales",
    "Marketing",
    "IT & Technology",
    "Repair & Maintenance",
    "Construction",
    "General Labour",
  ];

  const addSkill = () => {
    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim())) {
      setRequiredSkills([...requiredSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (sk: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== sk));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.safetyConfirmed) {
      toast.error("Safety Policy Required", "Please check the confirmation box below.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          payAmount: Number(formData.payAmount),
          workersRequired: Number(formData.workersRequired),
          requiredSkills,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Failed to Post Work", data.error || "Please check the form inputs");
      } else {
        toast.success("Job Posted Successfully! 🎉", "Your listing is now live in the local marketplace feed.");
        router.push("/employer/dashboard");
      }
    } catch (err: any) {
      toast.error("Network Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/employer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Post a New Local Job or Shift
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Reach verified local workers, students, and technicians within minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-600" /> Basic Details
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delivery Assistant (Weekend Rush) or Supermarket Shelf Stocker"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="PART_TIME">Part-time</option>
                    <option value="GIG">Gig / Single Shift</option>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="TEMPORARY">Temporary / Seasonal</option>
                    <option value="FLEXIBLE">Flexible Hours</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & Task Responsibilities
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Clearly explain the tasks required, reporting timing, dress code, and what the worker will be doing..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Section 2: Required Skills */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Required Skills</h3>

              <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-slate-50 rounded-xl border border-slate-200">
                {requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-xs font-semibold"
                  >
                    {sk}
                    <button type="button" onClick={() => removeSkill(sk)}>
                      <X className="w-3.5 h-3.5 hover:text-red-600" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a required skill (e.g. Two-Wheeler Driving, Excel, Barista)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addSkill}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            {/* Section 3: Location & Logistics */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" /> Location & Openings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specific Locality / Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SCO 28, Phase 7, Mohali"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Number of Workers Required
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.workersRequired}
                    onChange={(e) => setFormData({ ...formData, workersRequired: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Compensation */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" /> Compensation & Terms
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pay Amount (₹)</label>
                  <input
                    type="number"
                    min={50}
                    required
                    value={formData.payAmount}
                    onChange={(e) => setFormData({ ...formData, payAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pay Frequency</label>
                  <select
                    value={formData.payType}
                    onChange={(e) => setFormData({ ...formData, payType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="HOURLY">Hourly</option>
                    <option value="FIXED">Fixed (Per Task)</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 5: Safety Policy Compliance Confirmation */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.safetyConfirmed}
                  onChange={(e) => setFormData({ ...formData, safetyConfirmed: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded mt-0.5 border-slate-300 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-700 font-medium leading-relaxed">
                  I confirm that this job posting is accurate and complies with Work Adda policies. I agree that payment will be released upon completion verification.
                </span>
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Link href="/employer/dashboard">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" size="lg" isLoading={loading} className="font-bold px-8">
                Publish Work Listing
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
