"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import {
  Building2,
  MapPin,
  Globe,
  FileText,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/image-upload";

export default function EmployerProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Retail Shop");
  const [shopImage, setShopImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");

  const businessTypes = [
    "Retail Shop",
    "Logistics & Delivery",
    "Cafe & Restaurant",
    "Events & Catering",
    "Warehouse & Wholesale",
    "IT & Tech Startup",
    "Healthcare / Clinic",
    "Repair & Workshop",
    "Building Materials",
    "Agriculture & Cold Storage",
    "Individual / Household",
  ];

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/employers/profile");
        if (res.ok) {
          const data = await res.json();
          const p = data.employer;
          setProfile(p);
          setBusinessName(p.businessName || "");
          setBusinessType(p.businessType || "Retail Shop");
          setShopImage(p.shopImage || null);
          setDescription(p.description || "");
          setAddress(p.address || "");
          setLocation(p.location || "");
          setWebsite(p.website || "");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/employers/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          businessType,
          shopImage: shopImage || undefined,
          description,
          address,
          location,
          website: website || undefined,
        }),
      });

      if (res.ok) {
        toast.success("Business Profile Updated! ✔️");
      } else {
        const data = await res.json();
        toast.error("Failed to update profile", data.error);
      }
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="h-96 bg-white rounded-3xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Employer & Business Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build candidate trust by completing your verified business profile details.
          </p>
        </div>

        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-600" /> Business Details
            </h3>
            {profile?.verificationStatus === "VERIFIED" && (
              <Badge variant="success" className="font-bold">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Verified Employer
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Business Category</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
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

          {/* Shop / Workplace Image (Compulsory for employers) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <ImageUpload
              label="Shop / Workplace Front Photo"
              required={true}
              aspectRatio="video"
              placeholderIcon="store"
              description="A clear photo of your store, workshop, or office premises. Displayed to workers on job postings."
              value={shopImage}
              onChange={setShopImage}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">About the Business</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell candidates about your company culture, prompt payment record, and work environment..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Office / Store Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. SCO 14-15, Main Market"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City / Region</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Fatehabad, Sirsa or Hisar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Website URL (Optional)</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" size="lg" isLoading={saving} className="font-bold px-8">
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
