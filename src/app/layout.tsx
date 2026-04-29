import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BioGeniusProvider } from "@/context/BioGeniusContext";
import GlobalUI from "@/components/GlobalUI";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bio-Genius Optimizer",
  description: "Monitoring & Optimizer Platform",
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
        <BioGeniusProvider>
          <GlobalUI>
            {children}
          </GlobalUI>
        </BioGeniusProvider>
      </body>
    </html>
  );
}
