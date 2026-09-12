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
  AlertTriangle,
  Lock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RazorpayCheckoutButton } from "@/components/payments/razorpay-checkout";

export default function EmployerWorkPage() {
  const toast = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Approval modal state
  const [approveAssignment, setApproveAssignment] = useState<any | null>(null);
  const [approving, setApproving] = useState(false);

  // Release payment modal state
  const [releasePaymentItem, setReleasePaymentItem] = useState<any | null>(null);
  const [releasing, setReleasing] = useState(false);

  // Dispute modal state
  const [disputeItem, setDisputeItem] = useState<any | null>(null);
  const [disputeReason, setDisputeReason] = useState("Work quality below agreement");
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

  const handleApproveWork = async () => {
    if (!approveAssignment) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/assignments/${approveAssignment.id}/approve`, {
        method: "PATCH",
      });

      if (res.ok) {
        toast.success("Work Approved! 🌟", "You can now safely release the escrow funds to the worker.");
        const approved = approveAssignment;
        setApproveAssignment(null);
        await fetchAssignments();
        // Prompt employer to release the escrow funds
        setReleasePaymentItem(approved);
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

  const handleReleasePayment = async () => {
    if (!releasePaymentItem) return;
    setReleasing(true);
    try {
      const res = await fetch("/api/payments/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: releasePaymentItem.id,
          paymentId: releasePaymentItem.payment?.id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Escrow Funds Released! 💰", "Payment successfully transferred to worker account.");
        const releasedItem = releasePaymentItem;
        setReleasePaymentItem(null);
        await fetchAssignments();
        // Prompt for review
        setReviewAssignment(releasedItem);
      } else {
        toast.error("Release Failed", data.error || "Could not release payment.");
      }
    } catch (err: any) {
      toast.error("Network Error", err.message);
    } finally {
      setReleasing(false);
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
          "Escrow funds are safely frozen. Work Adda admin will inspect the evidence."
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
          reviewedUserId: reviewAssignment.worker.id,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        toast.success("Review Submitted! ⭐", "Worker rating has been updated.");
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
              Work Contracts & Escrow Payments
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Fund contracts securely via Razorpay, hold money in Escrow until completion, and release payouts with confidence.
            </p>
          </div>

          <Link href="/employer/payments">
            <Button size="sm" variant="outline">
              <CreditCard className="w-4 h-4 mr-1.5" /> Escrow Payment Ledger
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
            {assignments.map((item) => {
              const payment = item.payment;
              const isEscrowFunded = payment && (payment.escrowStatus === "HELD" || payment.escrowStatus === "RELEASE_ELIGIBLE");
              const isDisputed = payment && payment.escrowStatus === "DISPUTED";
              const isReleased = payment && (payment.escrowStatus === "RELEASED" || payment.escrowStatus === "SETTLED");
              const isRefunded = payment && payment.escrowStatus === "REFUNDED";
              const isAwaitingPayment = !payment || payment.escrowStatus === "PENDING" || payment.status === "FAILED";

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
                              : "warning"
                          }
                          className="font-bold text-xs"
                        >
                          {isReleased
                            ? "Payment Released"
                            : isDisputed
                            ? "Escrow Disputed"
                            : isEscrowFunded
                            ? "Secured in Escrow"
                            : "Escrow Deposit Pending"}
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

                  {/* Worker & Payment Details Strip */}
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
                        <span className="text-slate-400 block font-medium">Razorpay Escrow Status</span>
                        <span className="font-bold text-slate-800">
                          {isReleased
                            ? "RELEASED (Completed)"
                            : isDisputed
                            ? "DISPUTED (Locked)"
                            : isEscrowFunded
                            ? "HELD (Safe in Escrow)"
                            : isRefunded
                            ? "REFUNDED"
                            : "Awaiting Razorpay Deposit"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Escrow Guidance Banner */}
                  {isAwaitingPayment && (
                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                      <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold">Deposit Funds into Escrow</p>
                        <p className="text-amber-800 mt-0.5">
                          Deposit {formatCurrency(item.agreedAmount)} into Work Adda Escrow via Razorpay. Your funds remain 100% protected and are only released when you inspect and confirm job completion.
                        </p>
                      </div>
                    </div>
                  )}

                  {isEscrowFunded && (
                    <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold">Funds Safeguarded in Escrow</p>
                        <p className="text-emerald-800 mt-0.5">
                          ₹{payment.amount} is securely locked in Escrow. Payment ID:{" "}
                          <span className="font-mono text-emerald-950 font-bold">
                            {payment.razorpayPaymentId || payment.transactionId}
                          </span>
                          . The worker cannot access these funds until you confirm task completion.
                        </p>
                      </div>
                    </div>
                  )}

                  {isDisputed && (
                    <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold">Dispute Under Administrative Review</p>
                        <p className="text-red-800 mt-0.5">
                          Escrow funds are frozen. Work Adda dispute arbitration team is investigating the submitted details.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Link href="/employer/messages">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Message Worker
                        </Button>
                      </Link>

                      {isEscrowFunded && !isDisputed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDisputeItem(item)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Raise Dispute
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isAwaitingPayment ? (
                        <RazorpayCheckoutButton
                          assignmentId={item.id}
                          jobTitle={item.job?.title}
                          workerName={item.worker?.name}
                          amount={item.agreedAmount}
                          buttonText="Deposit in Escrow via Razorpay"
                          onSuccess={() => {
                            toast.success(
                              "Escrow Deposit Successful! 🔒",
                              "Funds are safely held in Work Adda Escrow. The worker can now begin work."
                            );
                            fetchAssignments();
                          }}
                          onError={(errMsg) => {
                            toast.error("Payment Error", errMsg);
                          }}
                        />
                      ) : item.status === "COMPLETED" ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setApproveAssignment(item)}
                          className="font-bold bg-amber-600 hover:bg-amber-700 shadow-sm text-white"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Review & Approve Completion
                        </Button>
                      ) : item.status === "APPROVED" || payment?.escrowStatus === "RELEASE_ELIGIBLE" ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setReleasePaymentItem(item)}
                          className="font-bold bg-emerald-600 hover:bg-emerald-700 shadow-sm text-white"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm & Release Escrow Payment
                        </Button>
                      ) : isReleased ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setReviewAssignment(item)}
                        >
                          <Star className="w-3.5 h-3.5 mr-1 text-amber-500" /> Rate Worker
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" /> Work in progress (Protected in Escrow)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
              Upon approval, you can release the secured escrow funds of{" "}
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

        {/* Modal: Release Escrow Payment */}
        <Modal
          isOpen={!!releasePaymentItem}
          onClose={() => setReleasePaymentItem(null)}
          title="Release Escrow Funds to Worker"
          description="Authorize Work Adda Escrow to release funds to the worker."
        >
          {releasePaymentItem && (
            <div className="space-y-4 text-left">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Agreed Job Amount:</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(releasePaymentItem.agreedAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Work Adda Platform Fee (0% Launch Offer):</span>
                  <span className="text-emerald-600 font-bold">₹0.00</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-emerald-700">
                  <span>Net Payout to Worker:</span>
                  <span>{formatCurrency(releasePaymentItem.agreedAmount)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                By confirming, the funds held securely in escrow will be released immediately to{" "}
                <strong>{releasePaymentItem.worker?.name}</strong>. This action is final and marks the contract as successfully settled.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setReleasePaymentItem(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  isLoading={releasing}
                  onClick={handleReleasePayment}
                  className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Confirm & Release Funds
                </Button>
              </div>
            </div>
          )}
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
                  <option value="Work quality below agreement">Work quality below agreed standard</option>
                  <option value="Worker did not show up">Worker failed to show up / abandon</option>
                  <option value="Incomplete job scope">Incomplete job scope</option>
                  <option value="Disagreement on terms">Disagreement on terms or timeline</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Describe the Issue in Detail
                </label>
                <textarea
                  rows={4}
                  required
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Explain what was agreed vs what was delivered. Include specific dates or shortcomings..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900">
                Raising a dispute immediately locks the escrow funds. Neither party can withdraw until resolution.
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
                  Lock Funds & Submit Dispute
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
