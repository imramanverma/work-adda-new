import { buildUpiIntentUri, validateUtr, getAppSpecificUpiUri } from "../lib/upi";

console.log("==========================================");
console.log("RUNNING WORK ADDA DIRECT UPI SYSTEM TESTS");
console.log("==========================================");

// 1. UPI Intent URI Generation
const uri = buildUpiIntentUri({
  vpa: "workadda@upi",
  name: "Work Adda Marketplace",
  amount: 2500,
  note: "Task: Electrical Repair",
  transactionRef: "asgn_12345",
});

console.log("\n1. Testing NPCI UPI URI generation...");
console.log("   Generated URI:", uri);
if (
  uri.includes("pa=workadda%40upi") &&
  uri.includes("am=2500.00") &&
  uri.includes("cu=INR")
) {
  console.log("   ✔ PASS: Standard NPCI UPI URI correctly formatted.");
} else {
  console.error("   ❌ FAIL: Unexpected URI format:", uri);
  process.exit(1);
}

// 2. Mobile App Intent schemes
console.log("\n2. Testing App-Specific UPI intent schemes...");
const phonePeUri = getAppSpecificUpiUri("phonepe", uri);
const paytmUri = getAppSpecificUpiUri("paytm", uri);
const gpayUri = getAppSpecificUpiUri("gpay", uri);

console.log("   PhonePe URI:", phonePeUri);
console.log("   Paytm URI:", paytmUri);
console.log("   Google Pay URI:", gpayUri);

if (
  phonePeUri.startsWith("phonepe://pay") &&
  paytmUri.startsWith("paytmmp://pay") &&
  gpayUri.startsWith("upi://pay")
) {
  console.log("   ✔ PASS: Mobile app schemes generated correctly.");
} else {
  console.error("   ❌ FAIL: App scheme replacement mismatch.");
  process.exit(1);
}

// 3. 12-Digit UTR Validation
console.log("\n3. Testing 12-Digit UTR Bank Reference Validator...");

const validUtr = "425983719201";
const checkValid = validateUtr(validUtr);
console.log(`   UTR '${validUtr}':`, checkValid.isValid ? "VALID" : "INVALID");
if (!checkValid.isValid) {
  console.error("   ❌ FAIL: Valid 12-digit UTR was marked invalid:", checkValid.error);
  process.exit(1);
}

const shortUtr = "12345";
const checkShort = validateUtr(shortUtr);
if (checkShort.isValid) {
  console.error("   ❌ FAIL: Short UTR was allowed.");
  process.exit(1);
}
console.log(`   Short UTR '${shortUtr}': Correctly Rejected -> "${checkShort.error}"`);

const dummyUtr = "000000000000";
const checkDummy = validateUtr(dummyUtr);
if (checkDummy.isValid) {
  console.error("   ❌ FAIL: Dummy repeated UTR was allowed.");
  process.exit(1);
}
console.log(`   Dummy UTR '${dummyUtr}': Correctly Rejected -> "${checkDummy.error}"`);

console.log("\n==========================================");
console.log("ALL DIRECT UPI TESTS PASSED SUCCESSFULLY! ✔");
console.log("==========================================");
