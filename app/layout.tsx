import "@/styles/globals.css";
import { Metadata } from "next";

import { Inter } from "next/font/google";
// import { siteConfig } from "@/config/site";
// import { fontSans } from "@/lib/fonts";
import { Toaster } from "@/components/ui/toaster";
import AppProvider from "@/components/app-provider";
import { env } from "@/env.mjs";
import Upgrader from "@/components/upgrader";
// import { SiteHeader } from "@/components/site-header";
// import { TailwindIndicator } from "@/components/tailwind-indicator";
// import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
export const metadata: Metadata = {
  title: "GND-PRODESK",
  description: "home page",
};

const inter = Inter({ subsets: ["latin"] });
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProd = env.NODE_ENV === "production";
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="print:hidden">
          <AppProvider>{children}</AppProvider>
          {!isProd && (
            <div className="fixed bottom-0 right-0 m-4">
              <Upgrader />
            </div>
          )}
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
