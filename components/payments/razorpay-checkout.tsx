"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Loader2,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Landmark,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { CustomUpiModal } from "./custom-upi-modal";

export { CustomUpiModal };

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

interface RazorpayCheckoutButtonProps {
  assignmentId: string;
  jobTitle: string;
  workerName: string;
  amount: number;
  onSuccess: (payment: any) => void;
  onError: (error: string) => void;
  className?: string;
  buttonText?: string;
}

type PaymentMethod = "UPI" | "CARD" | "NETBANKING";

export function RazorpayCheckoutButton({
  assignmentId,
  jobTitle,
  workerName,
  amount,
  onSuccess,
  onError,
  className = "",
  buttonText,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("UPI");
  const [upiId, setUpiId] = useState("employer@upi");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingStep, setProcessingStep] = useState("");

  const executeEscrowDeposit = async () => {
    setProcessingPayment(true);
    setProcessingStep("Connecting to Work Adda Escrow Vault...");

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep("Verifying payment authorization...");

      const res = await fetch("/api/payments/sandbox-fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, paymentMethod: selectedMethod }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment authorization failed.");
      }

      setProcessingStep("Securing funds in Escrow...");
      await new Promise((r) => setTimeout(r, 500));

      setShowGatewayModal(false);
      onSuccess(data.payment);
    } catch (err: any) {
      onError(err.message || "Failed to complete escrow deposit.");
    } finally {
      setProcessingPayment(false);
      setProcessingStep("");
    }
  };

  const handleButtonClick = async () => {
    // Check payment gateway mode
    const gatewayPreference = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || "DIRECT_UPI";
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const hasRealKeys =
      keyId &&
      keyId.startsWith("rzp_") &&
      !keyId.includes("placeholder") &&
      keyId !== "rzp_test_placeholder";

    // If configured explicitly for Razorpay and real keys are present
    if (gatewayPreference === "RAZORPAY" && hasRealKeys) {
      setLoading(true);
      try {
        const scriptLoaded = await loadRazorpayScript();
        if (scriptLoaded) {
          const orderRes = await fetch("/api/payments/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assignmentId }),
          });

          const orderData = await orderRes.json();
          if (orderRes.ok && orderData.orderId && orderData.keyId) {
            const options = {
              key: orderData.keyId,
              amount: orderData.amount,
              currency: orderData.currency || "INR",
              name: "Work Adda Escrow",
              description: `Escrow Deposit: ${jobTitle}`,
              order_id: orderData.orderId,
              image: "/favicon.ico",
              prefill: { name: "Hirer" },
              notes: { assignmentId, jobTitle, workerName },
              theme: { color: "#059669" },
              handler: async function (response: any) {
                try {
                  setLoading(true);
                  const verifyRes = await fetch("/api/payments/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                      assignmentId,
                    }),
                  });

                  const verifyData = await verifyRes.json();
                  if (verifyRes.ok) {
                    onSuccess(verifyData.payment);
                  } else {
                    onError(verifyData.error || "Payment verification failed.");
                  }
                } catch (verifyErr: any) {
                  onError(verifyErr.message || "Payment verification error.");
                } finally {
                  setLoading(false);
                }
              },
              modal: {
                ondismiss: () => setLoading(false),
              },
            };

            const razorpayInstance = new window.Razorpay(options);
            razorpayInstance.open();
            setLoading(false);
            return;
          }
        }
      } catch {
        setShowUpiModal(true);
      } finally {
        setLoading(false);
      }
    } else {
      // Default: Zero-commission direct UPI payment with QR code & mobile intent
      setShowUpiModal(true);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleButtonClick}
        isLoading={loading}
        className={`font-bold bg-emerald-600 hover:bg-emerald-700 shadow-sm text-white ${className}`}
      >
        <ShieldCheck className="w-4 h-4 mr-1.5" />
        {buttonText || `Deposit in Escrow (${formatCurrency(amount)})`}
      </Button>

      {/* Built-in Seamless Escrow Payment Gateway Modal */}
      <Modal
        isOpen={showGatewayModal}
        onClose={() => !processingPayment && setShowGatewayModal(false)}
        title="Work Adda Escrow Checkout"
        description={`Securely deposit ${formatCurrency(amount)} into Escrow`}
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          {/* Contract Breakdown Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Work Contract</span>
              <span className="font-bold text-slate-800 line-clamp-1 max-w-[200px] text-right">
                {jobTitle}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Contract Worker</span>
              <span className="font-bold text-slate-800">{workerName}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Platform Fee (Promo 0%)</span>
              <span className="font-bold text-emerald-600">₹0.00</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Total Escrow Deposit</span>
              <span className="font-black text-lg text-emerald-600">
                {formatCurrency(amount)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod("UPI")}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  selectedMethod === "UPI"
                    ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span className="text-[11px] leading-tight">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("CARD")}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  selectedMethod === "CARD"
                    ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <CreditCard className="w-5 h-5 text-brand-600" />
                <span className="text-[11px] leading-tight">Debit / Card</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("NETBANKING")}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  selectedMethod === "NETBANKING"
                    ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Landmark className="w-5 h-5 text-indigo-600" />
                <span className="text-[11px] leading-tight">Net Banking</span>
              </button>
            </div>
          </div>

          {/* Payment Method Details */}
          {selectedMethod === "UPI" && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 block">
                Virtual Payment Address (UPI ID)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@oksbi"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-1 rounded-md shrink-0">
                  Instant
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Supports Google Pay, PhonePe, Paytm, BHIM UPI & Banking Apps
              </p>
            </div>
          )}

          {selectedMethod === "CARD" && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Card Protection</span>
                <span className="font-bold text-slate-800">256-bit SSL Secured</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Supports Visa, MasterCard, RuPay, and Maestro debit/credit cards.
              </p>
            </div>
          )}

          {selectedMethod === "NETBANKING" && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Supported Banks</span>
                <span className="font-bold text-slate-800">50+ Indian Banks</span>
              </div>
              <p className="text-[11px] text-slate-500">
                SBI, HDFC Bank, ICICI Bank, Axis Bank, Kotak Mahindra, Punjab National Bank.
              </p>
            </div>
          )}

          {/* Escrow Protection Guarantee */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-950">
            <Lock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">100% Escrow Safeguard</p>
              <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                Funds are held in Work Adda Escrow. The worker cannot withdraw this money until you inspect and approve job completion.
              </p>
            </div>
          </div>

          {/* Processing Status Banner */}
          {processingPayment && (
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl flex items-center gap-2.5 text-xs text-brand-950 animate-pulse">
              <Loader2 className="w-4 h-4 text-brand-600 animate-spin shrink-0" />
              <p className="font-bold">{processingStep}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={processingPayment}
              onClick={() => setShowGatewayModal(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={executeEscrowDeposit}
              isLoading={processingPayment}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              Pay {formatCurrency(amount)} & Hold in Escrow
            </Button>
          </div>
        </div>
      </Modal>

      {/* Zero-Commission Direct UPI Modal */}
      <CustomUpiModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        assignmentId={assignmentId}
        amount={amount}
        jobTitle={jobTitle}
        workerName={workerName}
        onSuccess={(payment) => {
          setShowUpiModal(false);
          onSuccess(payment);
        }}
        onError={onError}
      />
    </>
  );
}
