import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SessionProvider } from "@/components/SessionProvider";
import { AuthButton } from "@/components/AuthButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Museum Compass",
  description: "企業博物館・歴史館を探索しよう",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <header className="sticky top-0 z-10 border-b border-border bg-background">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
              <Link href="/" className="text-lg font-bold text-foreground">
                Museum Compass
              </Link>
              <AuthButton />
            </div>
          </header>
          <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
