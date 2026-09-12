import Razorpay from "razorpay";
import crypto from "crypto";

const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

let razorpayClient: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay API credentials are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment."
    );
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id,
      key_secret,
    });
  }

  return razorpayClient;
}

export interface CreateOrderParams {
  amount: number; // in INR (Rupees)
  receipt: string; // internal payment or job ID
  notes?: Record<string, string>;
  currency?: string;
}

export async function createRazorpayOrder({
  amount,
  receipt,
  notes = {},
  currency = "INR",
}: CreateOrderParams) {
  const rzp = getRazorpayClient();
  const amountInPaisa = Math.round(amount * 100);

  const order = await rzp.orders.create({
    amount: amountInPaisa,
    currency,
    receipt,
    notes,
  });

  return order;
}

export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!key_secret) {
    throw new Error("RAZORPAY_KEY_SECRET is missing. Cannot verify signature.");
  }

  const generatedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // Constant-time string comparison to prevent timing attacks
  try {
    const genBuf = Buffer.from(generatedSignature, "utf8");
    const sigBuf = Buffer.from(signature, "utf8");
    if (genBuf.length !== sigBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(genBuf, sigBuf);
  } catch {
    return generatedSignature === signature;
  }
}

export function verifyWebhookSignature({
  rawBody,
  signature,
  webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "",
}: {
  rawBody: string;
  signature: string;
  webhookSecret?: string;
}): boolean {
  if (!webhookSecret) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is missing. Cannot verify webhook signature.");
  }

  const generatedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  try {
    const genBuf = Buffer.from(generatedSignature, "utf8");
    const sigBuf = Buffer.from(signature, "utf8");
    if (genBuf.length !== sigBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(genBuf, sigBuf);
  } catch {
    return generatedSignature === signature;
  }
}

export async function processRazorpayRefund({
  paymentId,
  amount, // optional amount in INR (Rupees); if omitted, full refund
  notes,
}: {
  paymentId: string;
  amount?: number;
  notes?: Record<string, string>;
}) {
  const rzp = getRazorpayClient();
  const params: { amount?: number; notes?: Record<string, string> } = {};

  if (amount && amount > 0) {
    params.amount = Math.round(amount * 100);
  }
  if (notes) {
    params.notes = notes;
  }

  const refund = await rzp.payments.refund(paymentId, params as any);
  return refund;
}
