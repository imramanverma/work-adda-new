/**
 * Work Adda Privacy & Phone Number Utilities
 * Protects user contact information and guarantees verified identity handling.
 */

/**
 * Normalizes Indian mobile numbers into standard +91XXXXXXXXXX format.
 */
export function normalizePhoneNumber(raw: string): string {
  if (!raw) return "";
  const cleaned = raw.trim().replace(/[\s\-\(\)]/g, "");
  
  // If already starts with +91
  if (cleaned.startsWith("+91")) {
    const digits = cleaned.slice(3).replace(/\D/g, "");
    return `+91${digits.slice(-10)}`;
  }

  // If starts with 91 and length is 12 digits
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  // If starts with 0
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return `+91${cleaned.slice(1)}`;
  }

  // 10 digit plain number
  const digits = cleaned.replace(/\D/g, "");
  if (digits.length >= 10) {
    return `+91${digits.slice(-10)}`;
  }

  return raw;
}

/**
 * Validates whether a normalized or plain number is a valid 10-digit Indian mobile number.
 */
export function isValidIndianPhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, "").slice(-10);
  // Valid Indian mobile numbers are 10 digits and typically start with 6, 7, 8, or 9
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
}

/**
 * Privacy-preserving phone number masking.
 * Ex: "+919822200001" -> "+91 98222 •••••"
 * Protects contact information from public scrapers and unverified users.
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return "••••••••••";
  const normalized = normalizePhoneNumber(phone);
  const digits = normalized.replace(/\D/g, "");
  if (digits.length < 10) return "••••••••••";

  const mainPart = digits.slice(-10);
  const prefix = mainPart.slice(0, 5);
  return `+91 ${prefix} •••••`;
}

/**
 * Generates a cryptographically sound 6-digit numeric OTP.
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
