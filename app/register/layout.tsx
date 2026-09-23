import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Free Account — Join as Worker, Student or Hirer",
  description:
    "Register for free on Work Adda. Connect with local employers, find nearby gigs, or hire verified local talent in Fatehabad, Sirsa & Hisar with ₹0 platform fee.",
  openGraph: {
    title: "Join Work Adda | Free Registration for Workers & Hirers",
    description: "Connect with local employers and workers in Fatehabad, Sirsa & Hisar with ₹0 platform fee.",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
