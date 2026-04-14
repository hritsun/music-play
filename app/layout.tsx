import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import LangProvider from "@/components/LangProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MusicPlay - Muzychni ihry dlia ditei",
  description: "Interaktyvna muzychna platforma dlia ditei 3-10 rokiv",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
