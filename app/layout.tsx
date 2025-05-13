import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PageContainer } from './components/layout/PageContainer';
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ui/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Test-Driven Learning Platform",
  description: "Learn programming concepts through interactive tests and AI guidance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
          <header className="border-b bg-background">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <h1 className="text-xl font-bold">Test-Driven Learning</h1>
              <ThemeToggle />
            </div>
          </header>
          <PageContainer>
            {children}
          </PageContainer>
        </ThemeProvider>
      </body>
    </html>
  );
}
