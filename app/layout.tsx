import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Grotesk } from 'next/font/google';
import "./globals.css";
import Navbar from "./components/Navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: "WinDay",
  description: "Your personal development companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <body className={`font-space-grotesk antialiased bg-gray-900`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
