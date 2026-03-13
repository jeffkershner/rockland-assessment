import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NavHeader } from "@/components/NavHeader";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Rockland Grants — FQHC Grant Discovery & Pipeline",
  description:
    "Discover, score, and track federal grant opportunities for Federally Qualified Health Centers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <NavHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
