"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  IndianRupee,
  MessageSquare,
  Star,
  ShieldCheck,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function WorkerWorkPage() {
  const router = useRouter();
  const toast = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Completion modal state
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [completing, setCompleting] = useState(false);

  // Dispute modal state
  const [disputeItem, setDisputeItem] = useState<any | null>(null);
  const [disputeReason, setDisputeReason] = useState("Employer unresponsive / payment not released");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [submittingDispute, setSubmittingDispute] = useState(false);

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

  const handleMarkComplete = async () => {
    if (!selectedAssignment) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/assignments/${selectedAssignment.id}/complete`, {
        method: "PATCH",
      });

      if (res.ok) {
        toast.success("Work Submitted! 📋", "Employer has been notified to verify and release escrow funds.");
        setSelectedAssignment(null);
        fetchAssignments();
      } else {
        const data = await res.json();
        toast.error("Error", data.error || "Failed to mark completion");
      }
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setCompleting(false);
    }
  };

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeItem) return;

    setSubmittingDispute(true);
    try {
      const res = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: disputeItem.payment?.id,
          reason: disputeReason,
          description: disputeDescription,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          "Dispute Registered ⚠️",
          "Escrow funds are safely frozen. Work Adda team will mediate and review."
        );
        setDisputeItem(null);
        setDisputeDescription("");
        fetchAssignments();
      } else {
        toast.error("Dispute Error", data.error || "Could not file dispute.");
      }
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setSubmittingDispute(false);
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
          reviewedUserId: reviewAssignment.employer.id,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        toast.success("Review Submitted! ⭐", "Thank you for rating the employer.");
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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Active Work & Escrow Contracts
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Work with confidence. See employer escrow deposits secured before starting tasks.
            </p>
          </div>

          <Link href="/worker/earnings">
            <Button size="sm" variant="outline">
              <IndianRupee className="w-4 h-4 mr-1.5" /> View Earnings Ledger
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-900">No active work contracts</h3>
            <p className="text-xs text-slate-500 mt-1">
              When an employer accepts your job application, your contract and progress tracker will show here.
            </p>
            <Link href="/jobs">
              <Button size="sm" variant="primary" className="mt-4">
                Explore Available Jobs
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {assignments.map((item) => {
              const payment = item.payment;
              const isEscrowFunded = payment && (payment.escrowStatus === "HELD" || payment.escrowStatus === "RELEASE_ELIGIBLE");
              const isDisputed = payment && payment.escrowStatus === "DISPUTED";
              const isReleased = payment && (payment.escrowStatus === "RELEASED" || payment.escrowStatus === "SETTLED");
              const isAwaitingEscrow = !payment || payment.escrowStatus === "PENDING" || payment.status === "FAILED";

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-sm transition space-y-4"
                >
                  {/* Header & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge
                          variant={
                            isReleased
                              ? "success"
                              : isDisputed
                              ? "destructive"
                              : isEscrowFunded
                              ? "brand"
                              : "outline"
                          }
                          className="font-bold"
                        >
                          {isReleased
                            ? "Payment Released"
                            : isDisputed
                            ? "Escrow Disputed"
                            : isEscrowFunded
                            ? "Payment Secured in Escrow"
                            : "Awaiting Employer Deposit"}
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

                  {/* Details Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      {item.employer?.employerProfile?.shopImage ? (
                        <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.employer.employerProfile.shopImage}
                            alt={item.employer.employerProfile.businessName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <span className="text-slate-400 block font-medium">Employer</span>
                        <span className="font-bold text-slate-800">
                          {item.employer?.employerProfile?.businessName || item.employer?.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                      <div>
                        <span className="text-slate-400 block font-medium">Location</span>
                        <span className="font-bold text-slate-800">{item.job?.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-slate-400 block font-medium">Escrow Protection</span>
                        <span className="font-bold text-slate-800">
                          {isReleased
                            ? "Funds Released to You"
                            : isDisputed
                            ? "Dispute Investigation"
                            : isEscrowFunded
                            ? "Secured by Razorpay Escrow"
                            : "Waiting for Employer to Fund"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Escrow Guidance Banner */}
                  {isEscrowFunded && (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold">100% Payment Guaranteed</p>
                        <p className="text-emerald-800 mt-0.5">
                          {formatCurrency(payment.workerAmount)} has been deposited by the employer into Work Adda Escrow. Your payout is guaranteed once you finish the job.
                        </p>
                      </div>
                    </div>
                  )}

                  {isAwaitingEscrow && (
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                      <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold">Awaiting Escrow Deposit</p>
                        <p className="text-amber-800 mt-0.5">
                          The employer has not yet funded the escrow for this task. You may message the employer to deposit funds before starting work.
                        </p>
                      </div>
                    </div>
                  )}

                  {isDisputed && (
                    <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold">Contract Disputed</p>
                        <p className="text-red-800 mt-0.5">
                          Escrow funds are temporarily frozen. The Work Adda support team is mediating this contract.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Link href="/worker/messages">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Message Employer
                        </Button>
                      </Link>

                      {isEscrowFunded && !isDisputed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDisputeItem(item)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Raise Issue
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === "ASSIGNED" || item.status === "IN_PROGRESS" ? (
                        <Button
                          size="sm"
                          variant="primary"
                          className="font-bold"
                          onClick={() => setSelectedAssignment(item)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark as Completed
                        </Button>
                      ) : item.status === "COMPLETED" ? (
                        <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 font-semibold flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> Completion Submitted. Waiting for Employer Escrow Release.
                        </span>
                      ) : item.status === "APPROVED" || payment?.escrowStatus === "RELEASE_ELIGIBLE" ? (
                        <span className="text-xs text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-brand-600" /> Work Approved! Escrow release in progress.
                        </span>
                      ) : isReleased ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setReviewAssignment(item)}
                        >
                          <Star className="w-3.5 h-3.5 mr-1 text-amber-500" /> Rate Employer
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Confirm Work Completion */}
        <Modal
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          title="Mark Task as Completed"
          description="Confirm you have finished the required work for this job."
        >
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to submit completion for <strong>{selectedAssignment?.job?.title}</strong>.
              The employer will be notified to inspect your work and release your payment of{" "}
              <strong className="text-emerald-700">{formatCurrency(selectedAssignment?.agreedAmount || 0)}</strong>.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setSelectedAssignment(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={completing}
                onClick={handleMarkComplete}
                className="font-bold"
              >
                Confirm Completion
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Raise Dispute */}
        <Modal
          isOpen={!!disputeItem}
          onClose={() => setDisputeItem(null)}
          title="Raise Escrow Dispute"
          description="Freeze escrow funds and request administrative arbitration."
        >
          {disputeItem && (
            <form onSubmit={handleRaiseDispute} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Dispute
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Employer unresponsive / payment not released">
                    Employer unresponsive / payment not released
                  </option>
                  <option value="Disagreement on job scope or extra work">
                    Disagreement on job scope or extra work
                  </option>
                  <option value="Employer refuses to approve completed work">
                    Employer refuses to approve completed work
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Describe What Happened
                </label>
                <textarea
                  rows={4}
                  required
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Explain the work you performed and why payment has not been received..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setDisputeItem(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submittingDispute}
                  className="font-bold bg-red-600 hover:bg-red-700 text-white"
                >
                  Submit Dispute
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Modal: Rate Employer */}
        <Modal
          isOpen={!!reviewAssignment}
          onClose={() => setReviewAssignment(null)}
          title="Rate Employer"
          description="Help build trust and reputation in the Work Adda community."
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Feedback / Experience</label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience working with this employer (clear instructions, safe conditions, timely escrow release)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setReviewAssignment(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={submittingReview} className="font-bold">
                Submit Review
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
