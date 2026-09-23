import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Grievance Redressal | Work Adda Support",
  description:
    "Get in touch with Work Adda support desk in Fatehabad, Sirsa & Hisar. Statutory IT Rules 2021 Grievance Officer details and rapid assistance.",
  openGraph: {
    title: "Contact Work Adda Support & Grievance Desk",
    description: "Support for local workers and businesses in Fatehabad, Sirsa & Hisar, Haryana.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
