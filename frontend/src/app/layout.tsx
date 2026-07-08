import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/layout/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "orderapp | Real-Time Order Management Dashboard",
  description: "A premium, clean full-stack order management system with instant status updates and customizable analytics grids.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-slate-950 text-slate-100 font-sans flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
