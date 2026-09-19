"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import {
  User,
  MapPin,
  Sparkles,
  Award,
  BookOpen,
  Briefcase,
  Clock,
  IndianRupee,
  Check,
  Plus,
  X,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/image-upload";
import { formatDate } from "@/lib/utils";

export default function WorkerProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [availability, setAvailability] = useState("Flexible");
  const [preferredJobType, setPreferredJobType] = useState("PART_TIME");
  const [preferredDistance, setPreferredDistance] = useState(10);
  const [expectedPay, setExpectedPay] = useState<number | "">("");
  const [location, setLocation] = useState("");

  const suggestedSkills = [
    "Two-Wheeler Driving",
    "Order Packing",
    "Inventory Stocking",
    "Customer Service",
    "Counter Sales",
    "Billing & Cashiering",
    "Data Entry & Excel",
    "Event Setup & Ushering",
    "Food Serving",
    "Barista Skills",
    "Residential Wiring",
    "Plumbing & Pipe Repair",
    "General Physical Labour",
    "Carpentry & Furniture Assembly",
    "Social Media Posting",
    "Computer Troubleshooting",
  ];

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/workers/profile");
        if (res.ok) {
          const data = await res.json();
          const p = data.profile;
          setProfile(p);
          setProfileImage(p.profileImage || null);
          setBio(p.bio || "");
          setSkills(p.skills || []);
          setExperience(p.experience || "");
          setEducation(p.education || "");
          setAvailability(p.availability || "Flexible");
          setPreferredJobType(p.preferredJobType || "PART_TIME");
          setPreferredDistance(p.preferredDistance || 10);
          setExpectedPay(p.expectedPay || "");
          setLocation(p.location || "");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const addSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/workers/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileImage: profileImage || undefined,
          bio,
          skills,
          experience,
          education,
          availability,
          preferredJobType,
          preferredDistance: Number(preferredDistance),
          expectedPay: expectedPay === "" ? null : Number(expectedPay),
          location,
        }),
      });

      if (res.ok) {
        toast.success("Profile Updated! ⭐", "Your skills and preferences have been updated.");
      } else {
        const data = await res.json();
        toast.error("Update Failed", data.error);
      }
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-96 bg-white rounded-3xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Worker Profile & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build your local credibility, add skills, and get matched to jobs within your preferred commute radius.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. Basic Info & Bio */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Personal & Contact Overview
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={profile?.name || user?.name || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="text"
                  disabled
                  value={profile?.email || user?.email || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / Locality</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Model Town, Fatehabad, Sirsa or Hisar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Worker Profile Photo (Optional) */}
            <div className="pt-2 border-t border-slate-100">
              <ImageUpload
                label="Worker Profile Photo"
                required={false}
                aspectRatio="square"
                placeholderIcon="user"
                description="A clear photo of yourself helps employers recognize you on the job site."
                value={profileImage}
                onChange={setProfileImage}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bio / Introduction
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short intro about your background, punctuality, and work ethic..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* 2. Skills Multi-Select */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Skills & Trade Competencies</h3>
                <p className="text-xs text-slate-500">
                  Skills carry a 40% weight in the Work Adda matching algorithm.
                </p>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                {skills.length} Selected
              </span>
            </div>

            {/* Selected Skills Pills */}
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-xl bg-slate-50 border border-slate-200">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-400 self-center px-2">
                  No skills added yet. Select from below or type custom skills.
                </span>
              ) : (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl text-xs font-semibold"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-600 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Custom Skill Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type another skill (e.g. Forklift, Tally, Barcode Scan)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(newSkillInput);
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => addSkill(newSkillInput)}
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {/* Suggested Skills Cloud */}
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-2">Suggested Local Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedSkills.map((sk) => {
                  const isSelected = skills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => (isSelected ? removeSkill(sk) : addSkill(sk))}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                        isSelected
                          ? "bg-brand-600 text-white border-brand-600 font-bold"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                      {sk}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Experience, Education, Availability & Pay */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Work History & Compensation Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Practical Experience & Past Work
                </label>
                <textarea
                  rows={2}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 2 years delivering for local shops; 50+ event ushering shifts..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Education / Certifications
                </label>
                <textarea
                  rows={2}
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. 12th Pass, ITI Electrician, Pursuing B.Com..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Availability</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Flexible">Flexible Shifts</option>
                  <option value="Full-time">Full-time (Daily)</option>
                  <option value="Part-time">Part-time (Mornings/Evenings)</option>
                  <option value="Weekends only">Weekends only</option>
                  <option value="Immediate / On-call">Immediate / On-call</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Type</label>
                <select
                  value={preferredJobType}
                  onChange={(e) => setPreferredJobType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="ANY">Any Type</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="GIG">Short Gigs / Shifts</option>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="TEMPORARY">Seasonal / Temporary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Max Commute</label>
                <select
                  value={preferredDistance}
                  onChange={(e) => setPreferredDistance(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value={2}>Within 2 km</option>
                  <option value={5}>Within 5 km</option>
                  <option value={10}>Within 10 km</option>
                  <option value={15}>Within 15 km</option>
                  <option value={25}>Within 25 km</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected Pay (₹/day)</label>
                <input
                  type="number"
                  value={expectedPay}
                  onChange={(e) => setExpectedPay(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 700"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" isLoading={saving} className="font-bold px-8">
              Save Profile Changes
            </Button>
          </div>
        </form>

        {/* 4. Community Reviews Received */}
        {profile?.reviews && profile.reviews.length > 0 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Employer Reviews & Ratings ({profile.reviews.length})
            </h3>

            <div className="divide-y divide-slate-100 space-y-3">
              {profile.reviews.map((r: any) => (
                <div key={r.id} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">
                      {r.reviewer?.employerProfile?.businessName || r.reviewer?.name}
                    </span>
                    <span className="text-amber-500 font-bold">★ {r.rating} / 5</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{r.comment || "Great punctuality and quality work."}"
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Task: {r.job?.title} • {formatDate(r.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
