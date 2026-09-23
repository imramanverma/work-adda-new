"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, UserCheck, Send, CheckCircle2, MessageSquare, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function ContactPage() {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "General Inquiry",
    district: "Fatehabad",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate brief network submission
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSubmitted(true);
    toast.success("Message Received! 📨", "Our Haryana support desk will contact you within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand-600 transition flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Contact Us</span>
        </div>

        {/* Header Hero */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-bold text-brand-800">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <span>Haryana Regional Support Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Contact Work Adda Support
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            Have a question about a local gig, escrow deposit, student assignment, or business partnership in Fatehabad, Sirsa, or Hisar? Our regional support team is here to assist you.
          </p>
        </div>

        {/* 2-Column Contact Info & Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Channels & Office Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Contact Cards */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Direct Channels
              </h3>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Customer Support Email</span>
                    <a href="mailto:support@workadda.com" className="font-bold text-slate-900 hover:text-brand-600 transition">
                      support@workadda.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Regional Helpline (Haryana)</span>
                    <a href="tel:+919876500000" className="font-bold text-slate-900 hover:text-brand-600 transition">
                      +91 98765 00000
                    </a>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Mon–Sat: 9:00 AM – 7:00 PM IST</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Operational Hub</span>
                    <span className="font-bold text-slate-900 block">
                      Work Adda Technologies
                    </span>
                    <span className="text-xs text-slate-500 block leading-relaxed mt-0.5">
                      Model Town / Main Market Area<br />
                      Fatehabad, Haryana - 125050, India
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statutory Grievance Redressal Card (IT Rules 2021) */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-900/10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-bold tracking-wide uppercase text-amber-300">
                <UserCheck className="w-3.5 h-3.5" />
                Statutory Grievance Officer
              </div>
              <h4 className="font-bold text-sm text-white">
                IT Rules (2021) Redressal Mechanism
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Under Rule 3(2) of the Information Technology (Intermediary Guidelines) Rules 2021:
              </p>
              <div className="pt-1 text-xs space-y-1.5 text-slate-200">
                <div><strong>Officer:</strong> Raman Kumar</div>
                <div><strong>Designation:</strong> Grievance & Compliance Officer</div>
                <div><strong>Email:</strong> <a href="mailto:grievance@workadda.com" className="text-amber-300 underline font-semibold">grievance@workadda.com</a></div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-white/10 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Acknowledged within 24h • Resolved within 15 days
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Send a Direct Message
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fill in your details below and our team will get back to you promptly.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-base text-slate-900">Message Delivered Successfully!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Thank you, <strong>{formData.name}</strong>. A support ticket has been created. We will reach you at <strong>{formData.phone || formData.email}</strong> shortly.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        category: "General Inquiry",
                        district: "Fatehabad",
                        message: "",
                      });
                    }}
                  >
                    Send Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Jaspreet Singh"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 9822200001"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. jaspreet@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Inquiry Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Escrow & Payment Support">Escrow & Payment Support</option>
                        <option value="Worker Profile / Verification">Worker Profile / Verification</option>
                        <option value="Employer / Store Support">Employer / Store Support</option>
                        <option value="Academic & Assignment Help">Academic & Assignment Help</option>
                        <option value="Dispute / Grievance Redressal">Dispute / Grievance Redressal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">District Location</label>
                      <select
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                      >
                        <option value="Fatehabad">Fatehabad, Haryana</option>
                        <option value="Sirsa">Sirsa, Haryana</option>
                        <option value="Hisar">Hisar, Haryana</option>
                        <option value="Other">Other Region</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Message or Issue Description</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe your query, task ID, or assistance needed in detail..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <Button type="submit" isLoading={submitting} className="w-full font-bold">
                    <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Inquiry
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
