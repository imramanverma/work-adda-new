"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const handleCheckout = async () => {
    setLoading(true);

    try {
      // 1. Load Razorpay Client SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Could not load Razorpay payment gateway. Please check your internet connection.");
      }

      // 2. Create Server-Side Order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initialize payment order.");
      }

      const { orderId, keyId, currency } = orderData;

      if (!keyId) {
        throw new Error("Razorpay Key ID is not configured on the server.");
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
      onError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleCheckout}
      isLoading={loading}
      className={`font-bold bg-emerald-600 hover:bg-emerald-700 shadow-sm text-white ${className}`}
    >
      <ShieldCheck className="w-4 h-4 mr-1.5" />
      {buttonText || `Pay Securely via Razorpay (${formatCurrency(amount)})`}
    </Button>
  );
}
