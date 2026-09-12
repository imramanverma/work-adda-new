"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  IndianRupee,
  CreditCard,
  Star,
  MessageSquare,
  ShieldCheck,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { calculatePaymentBreakdown } from "@/lib/payments";

export default function EmployerWorkPage() {
  const toast = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Approval modal state
  const [approveAssignment, setApproveAssignment] = useState<any | null>(null);
  const [approving, setApproving] = useState(false);

  // Payment modal state
  const [payAssignment, setPayAssignment] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [processingPayment, setProcessingPayment] = useState(false);

  // Review modal state
  const [reviewAssignment, setReviewAssignment] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/assignments");
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleApproveWork = async () => {
    if (!approveAssignment) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/assignments/${approveAssignment.id}/approve`, {
        method: "PATCH",
      });

      if (res.ok) {
        toast.success("Work Approved! 🌟", "You can now release the verified payment to the worker.");
        const approved = approveAssignment;
        setApproveAssignment(null);
        await fetchAssignments();
        // Automatically open the payment modal for a seamless workflow
        setPayAssignment(approved);
      } else {
        const data = await res.json();
        toast.error("Error", data.error);
      }
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAssignment) return;

    setProcessingPayment(true);
    try {
      const res = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: payAssignment.id,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Payment Disbursed! 💰", `₹${data.payment.amount} successfully transferred to ${payAssignment.worker.name}.`);
        const paidItem = payAssignment;
        setPayAssignment(null);
        await fetchAssignments();
        // Prompt for worker rating
        setReviewAssignment(paidItem);
      } else {
        toast.error("Payment Failed", data.error || "Could not process transaction");
      }
    } catch (err: any) {
      toast.error("Network Error", err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAssignment) return;

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: reviewAssignment.job.id,
          reviewedUserId: reviewAssignment.worker.id,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        toast.success("Review Submitted! ⭐", "Worker's rating has been updated.");
        setReviewAssignment(null);
        fetchAssignments();
      } else {
        const data = await res.json();
        toast.error("Review Error", data.error);
      }
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Work Contracts & Payout Approvals
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verify completion submissions, release escrow payments, and build trusted local worker relationships.
            </p>
          </div>

          <Link href="/employer/payments">
            <Button size="sm" variant="outline">
              <CreditCard className="w-4 h-4 mr-1.5" /> View Payment Ledger
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-white rounded-3xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-900">No active work contracts</h3>
            <p className="text-xs text-slate-500 mt-1">
              When you accept candidates from your applicant pool, their contracts will appear here.
            </p>
            <Link href="/employer/applicants">
              <Button size="sm" variant="primary" className="mt-4">
                Review Job Applicants
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {assignments.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-sm transition space-y-4"
              >
                {/* Header & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          item.status === "PAID"
                            ? "success"
                            : item.status === "APPROVED"
                            ? "brand"
                            : item.status === "COMPLETED"
                            ? "warning"
                            : "outline"
                        }
                        className="font-bold"
                      >
                        Status: {item.status}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        Started: {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {item.job?.title}
                    </h3>
                  </div>

                  <div className="sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                    <span className="text-xl font-black text-emerald-700">
                      {formatCurrency(item.agreedAmount)}
                    </span>
                    <p className="text-[11px] text-slate-400">Agreed Contract Pay</p>
                  </div>
                </div>

                {/* Worker Details Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                      {item.worker?.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Assigned Worker</span>
                      <span className="font-bold text-slate-800">{item.worker?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                    <div>
                      <span className="text-slate-400 block font-medium">Work Location</span>
                      <span className="font-bold text-slate-800">{item.job?.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-slate-400 block font-medium">Payment State</span>
                      <span className="font-bold text-slate-800">
                        {item.payment ? `${item.payment.status} (${item.payment.paymentMethod})` : "Pending Release"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <Link href="/employer/messages">
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Message Worker
                    </Button>
                  </Link>

                  <div className="flex items-center gap-2">
                    {item.status === "COMPLETED" ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setApproveAssignment(item)}
                        className="font-bold bg-amber-600 hover:bg-amber-700 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Review & Approve Completion
                      </Button>
                    ) : item.status === "APPROVED" ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setPayAssignment(item)}
                        className="font-bold bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                      >
                        <CreditCard className="w-4 h-4 mr-1.5" /> Release Payment (
                        {formatCurrency(item.agreedAmount)})
                      </Button>
                    ) : item.status === "PAID" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setReviewAssignment(item)}
                      >
                        <Star className="w-3.5 h-3.5 mr-1 text-amber-500" /> Rate Worker
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" /> Worker is currently performing task
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Approve Work Completion */}
        <Modal
          isOpen={!!approveAssignment}
          onClose={() => setApproveAssignment(null)}
          title="Approve Completed Work"
          description="Verify that the assigned worker has completed all required duties satisfactorily."
        >
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-600 leading-relaxed">
              Confirm that <strong>{approveAssignment?.worker?.name}</strong> has satisfactorily completed the task for{" "}
              <strong>{approveAssignment?.job?.title}</strong>.
            </p>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              Upon approval, you can disburse the agreed compensation of{" "}
              <strong>{formatCurrency(approveAssignment?.agreedAmount || 0)}</strong>.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setApproveAssignment(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={approving}
                onClick={handleApproveWork}
                className="font-bold bg-amber-600 hover:bg-amber-700"
              >
                Approve Work
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Release Payment */}
        <Modal
          isOpen={!!payAssignment}
          onClose={() => setPayAssignment(null)}
          title="Release Worker Payment"
          description="Securely disburse verified task compensation."
        >
          {payAssignment && (
            <form onSubmit={handleProcessPayment} className="space-y-4 text-left">
              {/* Payment Breakdown Card */}
              {(() => {
                const breakdown = calculatePaymentBreakdown(payAssignment.agreedAmount);
                return (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Agreed Amount:</span>
                      <span className="font-bold text-slate-900">{formatCurrency(breakdown.grossAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Work Adda Platform Fee (5%):</span>
                      <span className="text-slate-500">-{formatCurrency(breakdown.platformFee)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-emerald-700">
                      <span>Net Worker Payout:</span>
                      <span>{formatCurrency(breakdown.workerPayout)}</span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="UPI">Instant UPI (GPay / PhonePe / Paytm)</option>
                  <option value="BANK_TRANSFER">Direct Bank IMPS Transfer</option>
                  <option value="WALLET">Work Adda Escrow Wallet</option>
                  <option value="CASH">Verified Cash Settlement</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setPayAssignment(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={processingPayment}
                  className="font-bold bg-emerald-600 hover:bg-emerald-700"
                >
                  Confirm & Disburse Payment
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Modal: Rate Worker */}
        <Modal
          isOpen={!!reviewAssignment}
          onClose={() => setReviewAssignment(null)}
          title="Rate Worker Performance"
          description="Provide feedback to help build their local reputation score."
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition hover:scale-110"
                  >
                    <span className={rating >= star ? "text-amber-500" : "text-slate-300"}>★</span>
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">{rating} out of 5 stars</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Comments</label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share how the worker performed (punctuality, skill, speed, attitude)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setReviewAssignment(null)}>
                Skip
              </Button>
              <Button type="submit" variant="primary" isLoading={submittingReview} className="font-bold">
                Submit Worker Rating
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
