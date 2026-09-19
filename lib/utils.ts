import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatJobPay(job: {
  payAmount?: number | null;
  payType?: string | null;
  budgetType?: string | null;
  pricePerUnit?: number | null;
  unitType?: string | null;
  quantity?: number | null;
  categoryDetails?: any;
}): {
  rateText: string;
  subText: string;
} {
  const payType = (job.payType || "").toUpperCase();
  const budgetType = (job.budgetType || "").toUpperCase();
  const isPerPage = budgetType === "PER_PAGE" || payType === "PER_PAGE";

  if (isPerPage) {
    const rate = job.pricePerUnit !== null && job.pricePerUnit !== undefined ? job.pricePerUnit : 3;
    const unit = job.unitType || "page";
    const total = job.payAmount ? formatCurrency(job.payAmount) : null;
    const qty = job.quantity ? `${job.quantity} ${unit}s` : null;

    let addonsSum = 0;
    try {
      const details = typeof job.categoryDetails === "string" ? JSON.parse(job.categoryDetails) : job.categoryDetails;
      if (Array.isArray(details?.addons)) {
        addonsSum = details.addons.reduce((acc: number, item: any) => item.isEnabled ? acc + Number(item.amount || 0) : acc, 0);
      }
    } catch {}

    const addonsNote = addonsSum > 0 ? ` (+₹${addonsSum} addons)` : "";

    return {
      rateText: `₹${rate} / ${unit}`,
      subText: total ? `Total ${total}${qty ? ` (${qty})` : ""}${addonsNote}` : "",
    };
  }

  const payAmount = job.payAmount || 0;
  let typeSuffix = "";
  switch (payType) {
    case "DAILY":
      typeSuffix = "/day";
      break;
    case "MONTHLY":
      typeSuffix = "/month";
      break;
    case "HOURLY":
      typeSuffix = "/hr";
      break;
    case "WEEKLY":
      typeSuffix = "/week";
      break;
    case "FIXED":
      typeSuffix = "fixed";
      break;
    default:
      typeSuffix = payType ? `/${payType.toLowerCase().replace("_", " ")}` : "";
  }

  return {
    rateText: `${formatCurrency(payAmount)}${typeSuffix ? ` ${typeSuffix}` : ""}`,
    subText: "",
  };
}

