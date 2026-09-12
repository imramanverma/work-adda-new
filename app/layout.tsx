import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { SplashIntro } from "@/components/brand/splash-intro";

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
    <html lang="en">
      <body className="font-sans antialiased">
        <SplashIntro />
        <ToastProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-slate-50">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <MobileNav />
            </div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
