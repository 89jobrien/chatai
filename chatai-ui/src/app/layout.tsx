// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { ApiStatusProvider } from "@/context/ApiStatusContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatAI",
  description: "ChatAI UI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${firaCode.variable} font-sans antialiased flex flex-col min-h-screen`}
      >
        <ApiStatusProvider>
          <Navbar />
          <main className="container">{children}</main>
          <Footer />
        </ApiStatusProvider>
      </body>
    </html>
  );
}