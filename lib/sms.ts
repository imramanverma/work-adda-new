/**
 * Real-Life SMS Delivery Gateway for Work Adda
 *
 * Supports:
 * 1. Fast2SMS (India's leading instant OTP SMS gateway - https://www.fast2sms.com)
 * 2. 2Factor (Indian cellular OTP gateway - https://2factor.in)
 * 3. Twilio (Global SMS Gateway)
 */

interface SendSmsOptions {
  phone: string; // e.g. "+919822200001" or "9822200001"
  otp: string;   // 6-digit OTP code
}

interface SmsResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

export async function sendRealSmsOtp({ phone, otp }: SendSmsOptions): Promise<SmsResult> {
  const digits = phone.replace(/\D/g, "");
  const indian10Digits = digits.slice(-10);
  const e164Phone = `+91${indian10Digits}`;

  // 1. FAST2SMS (Direct Indian cellular carrier delivery to Jio, Airtel, Vi, BSNL)
  const fast2SmsKey = process.env.FAST2SMS_API_KEY?.trim();
  if (fast2SmsKey && fast2SmsKey !== "your_fast2sms_key_here") {
    try {
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2SmsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variables_values: otp,
          route: "otp",
          numbers: indian10Digits,
        }),
      });

      const data = await response.json();
      if (data.return === true) {
        console.log(`[Fast2SMS] Successfully sent live OTP to ${e164Phone}`);
        return {
          success: true,
          provider: "FAST2SMS",
          messageId: data.request_id || "sent",
        };
      } else {
        console.error(`[Fast2SMS Gateway Error]:`, data);
        const errMsg = Array.isArray(data.message) ? data.message.join(", ") : data.message;
        return {
          success: false,
          provider: "FAST2SMS",
          error: errMsg || "Fast2SMS gateway rejected delivery. Please check credits or API key.",
        };
      }
    } catch (err: any) {
      console.error("[Fast2SMS Network Error]:", err.message);
      return {
        success: false,
        provider: "FAST2SMS",
        error: `Fast2SMS network failure: ${err.message}`,
      };
    }
  }

  // 2. 2FACTOR.IN (Indian OTP cellular service)
  const twoFactorKey = process.env.TWOFACTOR_API_KEY?.trim();
  if (twoFactorKey && twoFactorKey !== "your_2factor_key_here") {
    try {
      const response = await fetch(
        `https://2factor.in/API/V1/${twoFactorKey}/SMS/${indian10Digits}/${otp}`,
        { method: "GET" }
      );
      const data = await response.json();
      if (data.Status === "Success") {
        console.log(`[2Factor] Successfully sent live OTP to ${e164Phone}`);
        return {
          success: true,
          provider: "2FACTOR",
          messageId: data.Details,
        };
      } else {
        console.error(`[2Factor Error]:`, data);
        return {
          success: false,
          provider: "2FACTOR",
          error: data.Details || "2Factor gateway error.",
        };
      }
    } catch (err: any) {
      console.error("[2Factor Network Error]:", err.message);
      return {
        success: false,
        provider: "2FACTOR",
        error: `2Factor network failure: ${err.message}`,
      };
    }
  }

  // 3. TWILIO SMS (International & Indian cellular delivery)
  const twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const twilioToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER?.trim();

  if (twilioSid && twilioToken && twilioFrom && twilioSid.startsWith("AC")) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
      const body = new URLSearchParams({
        To: e164Phone,
        From: twilioFrom,
        Body: `Your Work Adda verification code is ${otp}. Valid for 10 minutes. Do not share this with anyone.`,
      });

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        }
      );

      const data = await res.json();
      if (res.ok && data.sid) {
        console.log(`[Twilio] Live SMS sent to ${e164Phone} (SID: ${data.sid})`);
        return {
          success: true,
          provider: "TWILIO",
          messageId: data.sid,
        };
      } else {
        console.error(`[Twilio Error]:`, data);
        return {
          success: false,
          provider: "TWILIO",
          error: data.message || "Twilio delivery failed.",
        };
      }
    } catch (err: any) {
      console.error("[Twilio Network Error]:", err.message);
      return {
        success: false,
        provider: "TWILIO",
        error: `Twilio network failure: ${err.message}`,
      };
    }
  }

  // 4. NO REAL SMS GATEWAY CONFIGURED IN ENVIRONMENT
  // To send real SMS to an actual phone, an SMS service provider is required.
  console.warn(
    `\n==================== [WORK ADDA SMS GATEWAY NOT CONFIGURED] ====================\n` +
    `Target Mobile: ${e164Phone}\n` +
    `Generated OTP: ${otp}\n` +
    `Reason: No SMS API key found in .env (FAST2SMS_API_KEY, TWOFACTOR_API_KEY, or TWILIO)\n` +
    `Action: Please add your FAST2SMS_API_KEY in .env or Vercel Environment Variables to transmit live SMS.\n` +
    `=================================================================================\n`
  );

  return {
    success: false,
    provider: "NONE",
    error: "SMS Gateway not configured yet. To send real SMS to your phone, please add FAST2SMS_API_KEY in your .env or Vercel settings.",
  };
}
