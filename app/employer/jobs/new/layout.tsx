import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post a Job or Academic Task | Work Adda",
  description:
    "Post a local job or assignment in Fatehabad, Sirsa, or Hisar. Hire verified local talent with escrow payment safeguards.",
  openGraph: {
    title: "Post a Task in Haryana | Work Adda",
    description: "Hire local workers, students, and helpers with 100% escrow protection.",
  },
};

export default function PostJobLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
