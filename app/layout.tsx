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
  title: "Work Adda — Local Work. Local People. Local Growth.",
  description:
    "Local employment and task marketplace connecting students, skilled workers, gig seekers, and businesses across Haryana.",
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
