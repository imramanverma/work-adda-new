/**
 * Work Adda In-House Zero-Commission UPI Payment Engine
 * Generates direct NPCI-compliant UPI payment intent strings, QR codes,
 * and validates 12-digit bank UTR / Reference IDs.
 */

export interface UpiPaymentDetails {
  vpa: string;
  name: string;
  amount: number;
  note?: string;
  transactionRef?: string;
}

export const DEFAULT_UPI_CONFIG = {
  vpa: process.env.NEXT_PUBLIC_ADMIN_UPI_ID || "8708530217@fam",
  name: process.env.NEXT_PUBLIC_ADMIN_UPI_NAME || "Work Adda Marketplace",
  defaultFixedFee: Number(process.env.NEXT_PUBLIC_FIXED_PLATFORM_FEE || 29),
  autoApprovalEnabled: process.env.NEXT_PUBLIC_UPI_AUTO_APPROVAL === "true",
};

/**
 * Generates an NPCI-compliant UPI Intent URI
 * Example: upi://pay?pa=workadda@upi&pn=Work+Adda&am=29.00&cu=INR&tn=Job+Post+Fee
 */
export function buildUpiIntentUri(details: UpiPaymentDetails): string {
  const params = new URLSearchParams({
    pa: details.vpa.trim(),
    pn: details.name.trim(),
    am: details.amount.toFixed(2),
    cu: "INR",
    tn: (details.note || "Work Adda Payment").slice(0, 50),
  });

  if (details.transactionRef) {
    params.set("tr", details.transactionRef.slice(0, 30));
  }

  return `upi://pay?${params.toString()}`;
}

/**
 * Generates mobile app deep links for specific UPI providers
 */
export function getAppSpecificUpiUri(app: "gpay" | "phonepe" | "paytm" | "bhim", upiUri: string): string {
  // Most modern Android & iOS handlers recognize upi://pay directly via Intent Chooser.
  // Specialized schemes for direct app launching:
  switch (app) {
    case "phonepe":
      return upiUri.replace("upi://", "phonepe://");
    case "paytm":
      return upiUri.replace("upi://", "paytmmp://");
    case "gpay":
    case "bhim":
    default:
      return upiUri;
  }
}

/**
 * Returns a high-res, zero-dependency QR code SVG image URL for any UPI intent string
 */
export function getUpiQrCodeUrl(upiUri: string, size = 300): string {
  const encoded = encodeURIComponent(upiUri);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encoded}&format=svg`;
}

/**
 * Validates a 12-digit Indian Bank UTR (Unique Transaction Reference) / UPI Ref Number
 */
export function validateUtr(utr: string): { isValid: boolean; error?: string } {
  const clean = utr.trim();

  if (!clean) {
    return { isValid: false, error: "Please enter the 12-digit UPI UTR number from your payment app." };
  }

  if (!/^\d{12}$/.test(clean)) {
    return { isValid: false, error: "UTR must be exactly 12 numeric digits (e.g. 425819034812)." };
  }

  // Reject obvious fake/dummy numbers (e.g. 000000000000, 111111111111)
  if (/^(\d)\1{11}$/.test(clean)) {
    return { isValid: false, error: "Please enter a valid, real UTR number issued by your bank." };
  }

  return { isValid: true };
}
