import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { LanguageProvider } from "@/context/language-context";
import { ToastProvider } from "@/components/ui/toast";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { SplashIntro } from "@/components/brand/splash-intro";

import { AnimatedBackground } from "@/components/ui/animated-background";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://work-adda-new.vercel.app"),
  title: {
    default: "Work Adda — Local Work. Local People. Local Growth.",
    template: "%s | Work Adda",
  },
  description:
    "Hyperlocal employment and task marketplace connecting students, skilled workers, and businesses across Fatehabad, Sirsa & Hisar, Haryana. ₹0 platform fee with secure escrow.",
  keywords: [
    "Work Adda",
    "Fatehabad jobs",
    "Sirsa jobs",
    "Hisar gigs",
    "student part time work Haryana",
    "assignment work",
    "local helpers Haryana",
    "zero fee gig marketplace",
    "UPI escrow payouts",
  ],
  authors: [{ name: "Work Adda Team" }],
  creator: "Work Adda",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://work-adda-new.vercel.app",
    siteName: "Work Adda",
    title: "Work Adda — Hyperlocal Gigs & Work Marketplace in Haryana",
    description:
      "Find local gigs, student assignment work, store jobs, and skilled tasks in Fatehabad, Sirsa & Hisar. 100% Escrow Protected with ₹0 Platform Fee.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Work Adda — Local Work. Local People. Local Growth.",
    description:
      "Hyperlocal task & employment marketplace in Fatehabad, Sirsa & Hisar, Haryana. ₹0 Platform Fee & Escrow Safeguard.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden w-full max-w-full">
      <body className="font-sans antialiased overflow-x-hidden w-full max-w-full m-0 p-0">
        <SplashIntro />
        <ToastProvider>
          <LanguageProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col bg-slate-50/70 relative w-full max-w-full overflow-x-hidden">
                {/* Global Ambient Background Animation */}
                <AnimatedBackground intensity="subtle" className="fixed inset-0" />
                <Navbar />
                <main className="flex-1 relative z-10 pb-16 md:pb-0 w-full max-w-full overflow-x-hidden">{children}</main>
                <Footer />
                <MobileNav />
              </div>
            </AuthProvider>
          </LanguageProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
