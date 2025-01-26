"use client";
import { LoggedInLayout } from "@/components/(clean-code)/layouts/loggedin-layout";

export default function AuthLayout({ children }: any) {
    return <LoggedInLayout>{children}</LoggedInLayout>;
}
