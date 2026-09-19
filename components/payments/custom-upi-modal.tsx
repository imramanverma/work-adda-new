"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  QrCode,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  buildUpiIntentUri,
  getUpiQrCodeUrl,
  validateUtr,
  DEFAULT_UPI_CONFIG,
  getAppSpecificUpiUri,
} from "@/lib/upi";
import { useToast } from "@/components/ui/toast";

interface CustomUpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  amount: number;
  jobTitle: string;
  workerName: string;
  onSuccess: (payment: any) => void;
  onError?: (err: string) => void;
}

export function CustomUpiModal({
  isOpen,
  onClose,
  assignmentId,
  amount,
  jobTitle,
  workerName,
  onSuccess,
  onError,
}: CustomUpiModalProps) {
  const toast = useToast();
  const [utrNumber, setUtrNumber] = useState("");
  const [payerVpa, setPayerVpa] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"qr" | "apps">("qr");

  const adminVpa = DEFAULT_UPI_CONFIG.vpa;
  const adminName = DEFAULT_UPI_CONFIG.name;

  // Build UPI URI & dynamic QR code
  const upiUri = useMemo(() => {
    return buildUpiIntentUri({
      vpa: adminVpa,
      name: adminName,
      amount,
      note: `WorkAdda: ${jobTitle.slice(0, 30)}`,
      transactionRef: assignmentId.slice(-10),
    });
  }, [adminVpa, adminName, amount, jobTitle, assignmentId]);

  const qrCodeUrl = useMemo(() => {
    return getUpiQrCodeUrl(upiUri, 320);
  }, [upiUri]);

  // Copy VPA to clipboard
  const handleCopyVpa = () => {
    navigator.clipboard.writeText(adminVpa);
    setCopied(true);
    toast.success("Copied! 📋", `UPI ID ${adminVpa} copied to clipboard.`);
    setTimeout(() => setCopied(false), 2500);
  };

  // UTR Validation Status
  const utrStatus = useMemo(() => {
    if (!utrNumber) return null;
    return validateUtr(utrNumber);
  }, [utrNumber]);

  // Submit UTR
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    const check = validateUtr(utrNumber);
    if (!check.isValid) {
      toast.error("Invalid UTR", check.error || "Please enter a valid 12-digit UTR.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payments/custom-upi/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          utrNumber: utrNumber.trim(),
          upiVpa: payerVpa.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit UPI payment.");
      }

      if (data.isAutoApproved) {
        toast.success("Payment Confirmed! 🚀", "Funds successfully locked in Escrow.");
      } else {
        toast.success(
          "UTR Submitted! ⏳",
          "Your 12-digit reference has been recorded. Escrow will activate shortly."
        );
      }

      onSuccess(data.payment);
      onClose();
    } catch (err: any) {
      toast.error("Submission Failed", err.message);
      if (onError) onError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="Direct UPI Payment (0% Fee)"
      description={`Pay ${formatCurrency(amount)} directly via UPI with zero gateway charges`}
      maxWidth="md"
    >
      <div className="space-y-4 text-left">
        {/* Contract & Escrow Summary Card */}
        <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>Work Contract:</span>
            <span className="font-bold text-slate-900 truncate max-w-[180px]">{jobTitle}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>Assigned Worker:</span>
            <span className="font-bold text-slate-900">{workerName}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>Gateway Cut / Commission:</span>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[11px]">
              ₹0.00 (0% Fee)
            </span>
          </div>
          <div className="border-t border-emerald-200/70 pt-2 mt-2 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">Total Fixed Amount:</span>
            <span className="text-xl font-black text-emerald-700">{formatCurrency(amount)}</span>
          </div>
        </div>

        {/* View Switcher: QR Code vs Direct App Launch */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("qr")}
            className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === "qr"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Scan UPI QR Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("apps")}
            className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === "apps"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Pay via UPI App
          </button>
        </div>

        {/* Tab 1: Interactive QR Code View */}
        {activeTab === "qr" && (
          <div className="text-center p-3 bg-white border border-slate-200 rounded-2xl space-y-3">
            <div className="relative inline-block p-3 bg-white border-2 border-emerald-500/30 rounded-2xl shadow-sm">
              <img
                src={qrCodeUrl}
                alt="WorkAdda Direct UPI QR"
                className="w-44 h-44 mx-auto object-contain"
              />
              <div className="absolute inset-x-0 bottom-1 flex justify-center">
                <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> BHIM UPI Secured
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Open <strong>GPay, PhonePe, Paytm, or BHIM</strong> and scan this code
            </p>

            {/* VPA Copy Bar */}
            <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 overflow-hidden text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase">UPI ID:</span>
                <code className="font-mono font-bold text-slate-800 text-[11px] truncate">
                  {adminVpa}
                </code>
              </div>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1 shrink-0 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Direct Mobile Apps Launch */}
        {activeTab === "apps" && (
          <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-2.5">
            <p className="text-xs font-bold text-slate-700">Tap below to pay with installed app:</p>

            <div className="grid grid-cols-1 gap-2">
              <a
                href={getAppSpecificUpiUri("gpay", upiUri)}
                className="p-3 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center justify-between transition group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center font-black text-blue-600 text-xs">
                    G
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Google Pay</p>
                    <p className="text-[10px] text-slate-500">Instant UPI payment</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
              </a>

              <a
                href={getAppSpecificUpiUri("phonepe", upiUri)}
                className="p-3 bg-slate-50 hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 rounded-xl flex items-center justify-between transition group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center font-black text-purple-600 text-xs">
                    Pe
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">PhonePe</p>
                    <p className="text-[10px] text-slate-500">Fast direct checkout</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
              </a>

              <a
                href={getAppSpecificUpiUri("paytm", upiUri)}
                className="p-3 bg-slate-50 hover:bg-cyan-50/70 border border-slate-200 hover:border-cyan-300 rounded-xl flex items-center justify-between transition group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center font-black text-cyan-600 text-xs">
                    ₹
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Paytm / Any UPI App</p>
                    <p className="text-[10px] text-slate-500">Opens default UPI client</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition" />
              </a>
            </div>
          </div>
        )}

        {/* Step 2: Enter 12-Digit UTR Number */}
        <form onSubmit={handleSubmitPayment} className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                Enter 12-Digit UPI UTR / Reference ID
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-500">
                {utrNumber.trim().length}/12 Digits
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                maxLength={12}
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 425819034812"
                className={`w-full font-mono tracking-wider text-sm px-3.5 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 transition ${
                  utrStatus?.isValid
                    ? "border-emerald-500 text-emerald-900 focus:ring-emerald-500/20"
                    : utrStatus?.error
                    ? "border-rose-400 text-rose-900 focus:ring-rose-500/20"
                    : "border-slate-300 text-slate-900 focus:ring-emerald-500/20"
                }`}
              />
              {utrStatus?.isValid && (
                <div className="absolute right-3 top-2.5 text-emerald-600 flex items-center gap-1 text-[11px] font-bold">
                  <Check className="w-4 h-4" /> Valid
                </div>
              )}
            </div>

            <div className="flex items-start gap-1.5 text-[10px] text-slate-500 mt-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Find this in your payment app confirmation under <strong>"UPI Ref No"</strong>,{" "}
                <strong>"UTR"</strong>, or <strong>"Bank Reference ID"</strong>.
              </span>
            </div>
          </div>

          {/* Optional: Payer's own UPI ID for audit */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600">
              Your UPI ID (Optional)
            </label>
            <input
              type="text"
              value={payerVpa}
              onChange={(e) => setPayerVpa(e.target.value)}
              placeholder="e.g. yourname@okhdfcbank"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Escrow Guarantee Footer */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Direct UPI transfers go 100% to platform escrow without intermediary 2% cuts.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
              className="w-1/3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!utrStatus?.isValid}
              className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm py-2.5"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              Verify UTR & Lock Escrow
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
