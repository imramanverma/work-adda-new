import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Access Your Tasks & Payouts",
  description:
    "Sign in to your Work Adda account to view active tasks, escrow balance, contract deliverables, and direct UPI payouts.",
  openGraph: {
    title: "Sign In to Work Adda",
    description: "Access your local task contracts, job applications, and escrow earnings.",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
