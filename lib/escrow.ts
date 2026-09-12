import { db } from "@/lib/db";

export interface EscrowBreakdown {
  jobAmount: number;
  platformFeePercentage: number;
  platformFee: number;
  workerAmount: number;
}

/**
 * Computes platform fee and net worker allocation according to current environment settings.
 * Default is 0% platform fee (PLATFORM_FEE_ENABLED="false", PLATFORM_FEE_PERCENTAGE="0").
 */
export function calculateEscrowBreakdown(jobAmount: number): EscrowBreakdown {
  const isFeeEnabled = process.env.PLATFORM_FEE_ENABLED === "true";
  const feePct = isFeeEnabled
    ? parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || "0") || 0
    : 0;

  const platformFee = Math.round(jobAmount * (feePct / 100) * 100) / 100;
  const workerAmount = Math.round((jobAmount - platformFee) * 100) / 100;

  return {
    jobAmount,
    platformFeePercentage: feePct,
    platformFee,
    workerAmount,
  };
}

/**
 * Valid state transitions for Escrow & Payment lifecycle
 */
const VALID_ESCROW_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["HELD", "FAILED", "CANCELLED"],
  HELD: ["RELEASE_ELIGIBLE", "RELEASED", "DISPUTED", "REFUND_PENDING", "REFUNDED"],
  RELEASE_ELIGIBLE: ["RELEASED", "DISPUTED", "REFUND_PENDING"],
  DISPUTED: ["HELD", "RELEASE_ELIGIBLE", "RELEASED", "REFUND_PENDING", "REFUNDED"],
  REFUND_PENDING: ["REFUNDED", "FAILED", "HELD"],
  RELEASED: ["SETTLED"],
  SETTLED: [],
  REFUNDED: [],
  FAILED: ["PENDING"],
  CANCELLED: [],
};

export function isValidEscrowTransition(currentStatus: string, targetStatus: string): boolean {
  if (currentStatus === targetStatus) return true;
  const allowed = VALID_ESCROW_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(targetStatus);
}

export function assertValidEscrowTransition(currentStatus: string, targetStatus: string): void {
  if (!isValidEscrowTransition(currentStatus, targetStatus)) {
    throw new Error(
      `Invalid escrow state transition from "${currentStatus}" to "${targetStatus}".`
    );
  }
}

/**
 * Structured audit logging for all payment events
 */
export async function recordPaymentAudit({
  paymentId,
  jobId,
  actorId,
  actorRole,
  eventType,
  fromStatus,
  toStatus,
  metadata,
  client = db,
}: {
  paymentId: string;
  jobId: string;
  actorId?: string | null;
  actorRole?: "HIRER" | "WORKER" | "ADMIN" | "SYSTEM" | "WEBHOOK";
  eventType: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  metadata?: Record<string, any>;
  client?: any;
}) {
  try {
    return await client.paymentAuditLog.create({
      data: {
        paymentId,
        jobId,
        actorId: actorId || "SYSTEM",
        actorRole: actorRole || "SYSTEM",
        eventType,
        fromStatus: fromStatus || null,
        toStatus: toStatus || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error("Failed to write payment audit log:", error);
    return null;
  }
}
