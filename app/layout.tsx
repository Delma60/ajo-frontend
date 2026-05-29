import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../lib/auth.bootstrap";
import AuthProvider from "@/lib/providers/auth";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Ajo",
    default: "Ajo | Save together, grow together.",
  },
  description: "Join your community's rotating savings circle. Transparent, trusted, and on time — every cycle.",
  applicationName: "Ajo",
  keywords: ["Ajo", "rotating savings", "community savings", "fintech", "Nigeria", "savings circle"],
  openGraph: {
    title: "Ajo | Save together, grow together.",
    description: "Join your community's rotating savings circle. Transparent, trusted, and on time — every cycle.",
    url: "https://your-production-domain.com", // TODO: Update with actual production URL
    siteName: "Ajo Platform",
    locale: "en_NG", 
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajo | Save together, grow together.",
    description: "Transparent, trusted, and on time — every cycle.",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
