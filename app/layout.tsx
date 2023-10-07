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
import { cn } from "@/lib/utils";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { isProduction } from "@/lib/is-prod";

export const metadata: Metadata = {
    title: "GND-PRODESK",
    description: "home page"
};

const inter = Inter({ subsets: ["latin"] });
export default async function RootLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const isProd = await isProduction();
    const prodDB = env.DATABASE_URL?.includes("pscale");
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="print:hidden">
                    <AppProvider>{children}</AppProvider>

                    <div
                        className={cn(
                            isProd
                                ? "fixed z-[9999] bottom-0 left-0 opacity-0 w-5 h-5 overflow-hidden"
                                : "fixed bottom-0 right-0 mb-2"
                        )}
                    >
                        <Upgrader />
                    </div>
                    <Toaster />
                </div>
                <Analytics />
                <TailwindIndicator />
                {prodDB && !isProd && (
                    <div className="fixed bg-red-500 text-sm left-0 flex justify-center right-0  text-white top-0 z-[999]">
                        Production Database
                    </div>
                )}
            </body>
        </html>
    );
}
