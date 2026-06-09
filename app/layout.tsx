import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExpenseSplitter",
  description: "Split expenses and settle debts with friends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <header className="bg-blue-600 text-white py-4 px-4 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold">ExpenseSplitter</h1>
          </div>
        </header>
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
