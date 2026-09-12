"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, ArrowRight, RefreshCw, CheckCircle2, Lock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { maskPhoneNumber } from "@/lib/privacy";
import { useToast } from "@/components/ui/toast";
import { useLanguage } from "@/context/language-context";

interface OtpInputProps {
  phone: string;
  purpose: "REGISTER" | "LOGIN" | "PHONE_VERIFY";
  onVerified: (data: { phone: string; redirectUrl?: string }) => void;
  onCancel?: () => void;
  autoSendOnMount?: boolean;
}

export function OtpVerificationModal({
  phone,
  purpose,
  onVerified,
  onCancel,
  autoSendOnMount = true,
}: OtpInputProps) {
  const toast = useToast();
  const { language } = useLanguage();

  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Send OTP
  const sendOtp = async () => {
    if (!phone) return;
    setSending(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to send OTP.");
        toast.error("OTP Error", data.error || "Failed to send OTP.");
      } else {
        toast.success(
          language === "hi" ? "ओटीपी भेज दिया गया!" : "OTP Sent!",
          language === "hi"
            ? `${maskPhoneNumber(phone)} पर 6 अंकों का कोड भेजा गया है।`
            : `6-digit verification code sent to ${maskPhoneNumber(phone)}.`
        );
        setCountdown(60);
        setCanResend(false);
        // Focus on first input
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (autoSendOnMount) {
      sendOtp();
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Handle digit inputs
  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setErrorMsg("");

    // Auto-advance
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 entered, auto trigger verification
    if (newDigits.every((d) => d !== "") && index === 5) {
      const completeOtp = newDigits.join("");
      triggerVerify(completeOtp);
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setOtpDigits(newDigits);
    if (pasteData.length === 6) {
      triggerVerify(pasteData);
    } else {
      inputRefs.current[Math.min(pasteData.length, 5)]?.focus();
    }
  };

  // Verify OTP
  const triggerVerify = async (codeToVerify?: string) => {
    const fullOtp = codeToVerify || otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMsg(
        language === "hi"
          ? "कृपया पूरा 6 अंकों का ओटीपी दर्ज करें।"
          : "Please enter the complete 6-digit OTP code."
      );
      return;
    }

    setVerifying(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp: fullOtp,
          purpose,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Invalid OTP code.");
        toast.error("Verification Failed", data.error || "Invalid OTP code.");
      } else {
        toast.success(
          language === "hi" ? "सत्यापन सफल! ✓" : "Verified Successfully! ✓",
          language === "hi"
            ? "मोबाइल नंबर सफलतापूर्वक सत्यापित हो गया है।"
            : "Phone number verified securely."
        );
        onVerified({
          phone: data.phone || phone,
          redirectUrl: data.redirectUrl,
        });
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Network error verifying OTP.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Info */}
      <div className="text-center space-y-1.5">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
          <Smartphone className="w-5 h-5 text-emerald-600" />
        </div>
        <h3 className="font-extrabold text-base text-slate-900">
          {language === "hi" ? "मोबाइल नंबर सत्यापन" : "Verify Phone Number"}
        </h3>
        <p className="text-xs text-slate-500">
          {language === "hi" ? (
            <>
              सत्यापन कोड भेजा गया: <strong className="text-slate-800">{maskPhoneNumber(phone)}</strong>
            </>
          ) : (
            <>
              Enter the 6-digit code sent to{" "}
              <strong className="text-slate-800">{maskPhoneNumber(phone)}</strong>
            </>
          )}
        </p>
      </div>

      {/* 6-Digit OTP Boxes */}
      <div className="flex justify-center items-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
        {otpDigits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-xl border transition focus:outline-none ${
              errorMsg
                ? "border-red-400 bg-red-50/40 text-red-900 focus:ring-2 focus:ring-red-400"
                : digit
                ? "border-brand-500 bg-brand-50/30 text-brand-900 font-bold focus:ring-2 focus:ring-brand-400"
                : "border-slate-200 bg-white text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-400"
            }`}
          />
        ))}
      </div>

      {errorMsg && (
        <p className="text-xs text-red-600 font-medium text-center animate-in fade-in">
          {errorMsg}
        </p>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <Button
          type="button"
          onClick={() => triggerVerify()}
          isLoading={verifying}
          className="w-full font-bold shadow-md shadow-brand-500/20"
        >
          {language === "hi" ? "ओटीपी सत्यापित करें" : "Verify & Proceed"}
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>

        <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
          {canResend ? (
            <button
              type="button"
              onClick={sendOtp}
              disabled={sending}
              className="text-brand-600 hover:text-brand-700 font-bold inline-flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${sending ? "animate-spin" : ""}`} />
              {language === "hi" ? "ओटीपी दोबारा भेजें" : "Resend OTP"}
            </button>
          ) : (
            <span className="text-slate-400">
              {language === "hi"
                ? `पुनः भेजने का समय: ${countdown}s`
                : `Resend code in ${countdown}s`}
            </span>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 underline font-medium"
            >
              {language === "hi" ? "रद्द करें" : "Change Number"}
            </button>
          )}
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          {language === "hi"
            ? "वर्क अड्डा प्राइवेसी सिस्टम: आपका नंबर सुरक्षित रूप से एन्क्रिप्ट किया जाता है और किसी भी थर्ड-पार्टी से साझा नहीं किया जाता।"
            : "Work Adda Privacy System: Your mobile number is verified for genuine local identity and masked to protect you from spam."}
        </span>
      </div>
    </div>
  );
}
