import crypto from "crypto";
import { calculateEscrowBreakdown, isValidEscrowTransition, assertValidEscrowTransition } from "../lib/escrow";
import { verifyPaymentSignature, verifyWebhookSignature } from "../lib/razorpay";

console.log("==========================================");
console.log("RUNNING WORK ADDA ESCROW & RAZORPAY UNIT TESTS");
console.log("==========================================");

// 1. Test Escrow Breakdown Calculation
console.log("\n1. Testing Escrow Breakdown Calculation...");
const sampleJobAmount = 2500;
const breakdown = calculateEscrowBreakdown(sampleJobAmount);
console.log("   Agreed Job Amount:", breakdown.jobAmount);
console.log("   Platform Fee Percentage:", breakdown.platformFeePercentage + "%");
console.log("   Calculated Platform Fee:", breakdown.platformFee);
console.log("   Net Worker Amount:", breakdown.workerAmount);

if (breakdown.platformFee === 0 && breakdown.workerAmount === 2500) {
  console.log("   ✔ PASS: 0% Platform fee is active. Worker gets 100% of payout.");
} else {
  throw new Error("FAIL: Platform fee calculation mismatch");
}

// 2. Test Escrow State Machine Transitions
console.log("\n2. Testing State Transitions...");
const validTransitions = [
  ["PENDING", "HELD"],
  ["HELD", "RELEASE_ELIGIBLE"],
  ["RELEASE_ELIGIBLE", "RELEASED"],
  ["HELD", "DISPUTED"],
  ["DISPUTED", "RELEASED"],
  ["DISPUTED", "REFUNDED"],
  ["HELD", "REFUND_PENDING"],
  ["REFUND_PENDING", "REFUNDED"],
];

for (const [from, to] of validTransitions) {
  if (isValidEscrowTransition(from, to)) {
    console.log(`   ✔ Valid: ${from} -> ${to}`);
  } else {
    throw new Error(`FAIL: Valid transition failed: ${from} -> ${to}`);
  }
}

// Test invalid transitions
const invalidTransitions = [
  ["PENDING", "RELEASED"], // Cannot release funds without holding first!
  ["SETTLED", "HELD"],     // Terminal state
  ["REFUNDED", "HELD"],    // Terminal state
  ["REFUNDED", "RELEASED"],// Cannot release refunded money!
];

for (const [from, to] of invalidTransitions) {
  if (!isValidEscrowTransition(from, to)) {
    console.log(`   ✔ Correctly Blocked Invalid: ${from} -> ${to}`);
  } else {
    throw new Error(`FAIL: Invalid transition was allowed: ${from} -> ${to}`);
  }
}

// 3. Test Cryptographic HMAC-SHA256 Signature Verification
console.log("\n3. Testing Razorpay HMAC-SHA256 Signature Verification...");
const secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret_for_unit_test";
process.env.RAZORPAY_KEY_SECRET = secret;

const orderId = "order_test_987654";
const paymentId = "pay_test_123456";

// Compute expected HMAC
const validSig = crypto
  .createHmac("sha256", secret)
  .update(`${orderId}|${paymentId}`)
  .digest("hex");

const isVerified = verifyPaymentSignature({
  orderId,
  paymentId,
  signature: validSig,
});

if (isVerified) {
  console.log("   ✔ PASS: Valid signature correctly verified.");
} else {
  throw new Error("FAIL: Valid signature was rejected.");
}

// Test tampered signature
const tamperedSig = validSig.slice(0, -2) + "ff";
const isTamperedRejected = !verifyPaymentSignature({
  orderId,
  paymentId,
  signature: tamperedSig,
});

if (isTamperedRejected) {
  console.log("   ✔ PASS: Tampered signature correctly rejected.");
} else {
  throw new Error("FAIL: Tampered signature was accepted!");
}

console.log("\n==========================================");
console.log("ALL ESCROW & RAZORPAY UNIT TESTS PASSED! ✔");
console.log("==========================================");
