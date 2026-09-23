import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover Local Gigs & Academic Tasks in Haryana",
  description:
    "Browse verified local jobs, student assignment tasks, retail assistance, and skilled trades across Fatehabad, Sirsa, and Hisar. 100% Escrow protected with ₹0 fee.",
  openGraph: {
    title: "Discover Local Gigs in Fatehabad, Sirsa & Hisar | Work Adda",
    description: "Browse verified shifts, academic assignment help, delivery tasks, and store jobs nearby.",
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
