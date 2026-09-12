export interface PaymentProvider {
  name: string;
  createOrder(amount: number, currency: string, metadata?: Record<string, any>): Promise<{
    orderId: string;
    amount: number;
    currency: string;
  }>;
  processPayment(orderId: string, paymentMethod: string): Promise<{
    success: boolean;
    transactionId: string;
    status: "SUCCESS" | "FAILED" | "PENDING";
    message: string;
  }>;
  refundPayment(transactionId: string, amount: number): Promise<{
    success: boolean;
    refundId: string;
    status: "REFUNDED" | "FAILED";
  }>;
}

export const PLATFORM_FEE_PERCENTAGE = 5.0; // 5% Work Adda Platform Fee

export function calculatePaymentBreakdown(grossAmount: number) {
  const platformFee = Math.round(grossAmount * (PLATFORM_FEE_PERCENTAGE / 100) * 100) / 100;
  const workerPayout = Math.round((grossAmount - platformFee) * 100) / 100;

  return {
    grossAmount,
    platformFeePercentage: PLATFORM_FEE_PERCENTAGE,
    platformFee,
    workerPayout,
  };
}

/**
 * Mock Payment Provider implementation for reliable local dev and automated flows
 */
class MockPaymentProvider implements PaymentProvider {
  name = "WorkAdda-SecurePay-Mock";

  async createOrder(amount: number, currency = "INR") {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      orderId,
      amount,
      currency,
    };
  }

  async processPayment(orderId: string, paymentMethod = "UPI") {
    // Generates a mock banking transaction identifier
    const transactionId = `TXN_WA_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      transactionId,
      status: "SUCCESS" as const,
      message: `Payment of method ${paymentMethod} verified successfully via simulated gateway.`,
    };
  }

  async refundPayment(transactionId: string, amount: number) {
    const refundId = `RFD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      refundId,
      status: "REFUNDED" as const,
    };
  }
}

export const paymentProvider = new MockPaymentProvider();
