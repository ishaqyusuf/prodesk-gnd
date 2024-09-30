import "@/styles/globals.css";
import { Metadata } from "next";

import { Inter } from "next/font/google";
// import { siteConfig } from "@/config/site";
// import { fontSans } from "@/lib/fonts";
import { Toaster } from "@/components/ui/toaster";
import AppProvider from "@/components/_v1/app-provider";
import { env } from "@/env.mjs";
import Upgrader from "@/components/_v1/upgrader";
// import { SiteHeader } from "@/components/site-header";
// import { TailwindIndicator } from "@/components/tailwind-indicator";
// import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";
import { TailwindIndicator } from "@/components/_v1/tailwind-indicator";
import { Cmd } from "@/components/cmd";
import PageAnalytics from "@/lib/analytics/page-analytics";
import { Suspense } from "react";
import { __isProd } from "@/lib/is-prod-server";
import dayjs from "dayjs";

export const metadata: Metadata = {
    title: "GND-PRODESK",
    description: "home page",
};

// const inter = Inter({ subsets: ["latin"] });
export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const prodDB = env.DATABASE_URL?.includes("pscale");
    // if (dayjs().minute() > 12) throw new Error("digest error");
    // await sendMsg("+2348186877306", "Hello Ishaq");
    return (
        <html lang="en">
            <body>
                <div className="print:hidden">
                    <AppProvider>
                        {children}
                        <Suspense>
                            <PageAnalytics />
                        </Suspense>
                    </AppProvider>
                    <div
                        className={cn(
                            __isProd
                                ? "fixed z-[9999] bottom-0 left-0 opacity-0 w-5 h-5 overflow-hidden"
                                : "fixed bottom-0 right-0 mb-2"
                        )}
                    >
                        <Upgrader />
                    </div>
                    <Toaster />
                    <Analytics />
                    <TailwindIndicator />
                    {prodDB && !__isProd && (
                        <div className="fixed bg-red-500 text-sm left-0 flex justify-center right-0  text-white top-0 z-[999]">
                            Production Database
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
