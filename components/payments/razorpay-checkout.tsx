"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  AlertCircle,
  Loader2,
  Key,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";

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
      console.error("Failed to load Razorpay SDK script.");
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
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState("");

  const handleSandboxDeposit = async () => {
    setSandboxLoading(true);
    try {
      const res = await fetch("/api/payments/sandbox-fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Sandbox escrow deposit failed.");
      }

      setShowConfigModal(false);
      onSuccess(data.payment);
    } catch (err: any) {
      onError(err.message || "Failed to complete sandbox deposit.");
    } finally {
      setSandboxLoading(false);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);

    try {
      // 1. Create Server-Side Order first to check configuration
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        const errText = orderData.error || orderData.message || "";
        const isKeyMissing =
          orderData.isKeyMissing ||
          errText.includes("api key") ||
          errText.includes("credentials") ||
          errText.includes("placeholder");

        if (isKeyMissing) {
          setModalErrorMessage(errText);
          setShowConfigModal(true);
          setLoading(false);
          return;
        }

        throw new Error(errText || "Failed to initialize payment order.");
      }

      const { orderId, keyId, currency } = orderData;

      if (!keyId || keyId.includes("placeholder")) {
        setModalErrorMessage("Razorpay Key ID is missing or set to placeholder.");
        setShowConfigModal(true);
        setLoading(false);
        return;
      }

      // 2. Load Razorpay Client SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Could not load Razorpay payment gateway script. Please check your network connection.");
      }

      // 3. Configure Razorpay Popup Options
      const options = {
        key: keyId,
        amount: orderData.amount, // in paisa
        currency: currency || "INR",
        name: "Work Adda Escrow",
        description: `Escrow Deposit: ${jobTitle}`,
        order_id: orderId,
        image: "/favicon.ico",
        prefill: {
          name: "Hirer",
        },
        notes: {
          assignmentId,
          jobTitle,
          workerName,
        },
        theme: {
          color: "#059669", // Emerald 600
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            setLoading(true);
            // 4. Cryptographic Server-Side Signature Verification & Escrow Lock
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

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            onSuccess(verifyData.payment);
          } catch (verifyErr: any) {
            onError(verifyErr.message || "Failed to verify payment with server.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (failureResponse: any) {
        onError(failureResponse.error?.description || "Payment failed at gateway.");
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred.";
      if (
        msg.includes("api key") ||
        msg.includes("credentials") ||
        msg.includes("placeholder")
      ) {
        setModalErrorMessage(msg);
        setShowConfigModal(true);
      } else {
        onError(msg);
      }
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleCheckout}
        isLoading={loading}
        className={`font-bold bg-emerald-600 hover:bg-emerald-700 shadow-sm text-white ${className}`}
      >
        <ShieldCheck className="w-4 h-4 mr-1.5" />
        {buttonText || `Pay Securely via Razorpay (${formatCurrency(amount)})`}
      </Button>

      {/* Razorpay Key Configuration & Sandbox Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="Razorpay Escrow Setup & Sandbox Mode"
        description="Fund your contract escrow with real Razorpay or instant test sandbox"
        maxWidth="lg"
      >
        <div className="space-y-5 text-left">
          {/* Status Alert */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <Key className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm text-amber-950">
                Razorpay API Key Required for Live Checkout
              </p>
              <p className="text-amber-800 mt-1 leading-relaxed">
                Work Adda is integrated with official Razorpay banking APIs. To open the Razorpay UPI/Card checkout modal, your project needs a valid Razorpay Key ID and Secret.
              </p>
              {modalErrorMessage && (
                <p className="mt-1.5 font-mono text-[11px] text-amber-900 bg-amber-100/70 px-2 py-1 rounded-md inline-block">
                  Gateway Notice: {modalErrorMessage}
                </p>
              )}
            </div>
          </div>

          {/* Option 1: Instant Sandbox Escrow Deposit */}
          <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                <Sparkles className="w-3 h-3" /> Recommended for Testing
              </span>
              <span className="font-extrabold text-sm text-emerald-900">
                Amount: {formatCurrency(amount)}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Test Escrow Workflow Right Now (Sandbox Deposit)
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Deposit {formatCurrency(amount)} directly into Work Adda Escrow without waiting for Razorpay API keys. This fully executes the real Escrow state machine (`HELD` &rarr; `RELEASE_ELIGIBLE` &rarr; `RELEASED`), notifies the worker, and updates your ledger.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleSandboxDeposit}
              isLoading={sandboxLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Deposit {formatCurrency(amount)} in Escrow (Sandbox Mode)
            </Button>
          </div>

          {/* Option 2: Connect Real Razorpay Keys */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-brand-600" />
                How to get Free Razorpay Test Keys in 2 minutes:
              </h4>
              <a
                href="https://dashboard.razorpay.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brand-600 hover:text-brand-700 font-bold inline-flex items-center gap-1"
              >
                Open Razorpay <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Sign up or log in at <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="text-brand-600 underline font-semibold">dashboard.razorpay.com</a> (Free, zero KYC/documents needed for Test Mode).</li>
              <li>Toggle to <strong>Test Mode</strong> at the top of your dashboard.</li>
              <li>Go to <strong>Account & Settings &rarr; API Keys &rarr; Generate Key</strong>.</li>
              <li>Add your <code className="bg-slate-200/80 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800">RAZORPAY_KEY_ID</code> and <code className="bg-slate-200/80 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800">RAZORPAY_KEY_SECRET</code> into your <code className="bg-slate-200/80 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800">.env</code> file or Vercel Environment Variables.</li>
            </ol>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowConfigModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
