"use client";
import { Navbar } from "./nav/navbar";

interface ContentLayoutProps {
    title?: string;
    children?: React.ReactNode;
}

export function ContentLayout({ title, children }: ContentLayoutProps) {
    return (
        <div>
            <Navbar />
            <div className="bg-white dark:bg-inherit" id="pageTab"></div>
            <div className="scontainer pt-8 pb-8 px-4 sm:px-8">{children}</div>
        </div>
    );
}
