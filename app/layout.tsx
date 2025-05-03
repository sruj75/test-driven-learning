import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoadmapProvider } from './contexts/RoadmapContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RoadmapProvider>
          {children}
        </RoadmapProvider>
      </body>
    </html>
  );
}
