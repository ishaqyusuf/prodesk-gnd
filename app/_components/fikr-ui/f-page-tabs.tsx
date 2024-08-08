"use client";

import { Button } from "@/components/ui/button";
import FContentShell from "./f-content-shell";
import { cn } from "@/lib/utils";
import { PrimitiveDivProps } from "@radix-ui/react-tabs";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { usePathname, useSearchParams } from "next/navigation";
// import Link from "next/link";

interface Props extends PrimitiveDivProps {}

interface FormProps {
    currentTab?: string;
    tabs: {
        [tab in string]: TabProps;
    };
    tabData: {
        [tab in string]: {
            current?: boolean;
            url?: string;
        };
    };
}
const useCtx = () => {
    const query = useSearchParams();
    const pathname = usePathname();
    const form = useForm<FormProps>({
        defaultValues: {
            currentTab: null,
            tabs: {},
        },
    });
    const [currentTab, tabs, tabData] = form.watch([
        "currentTab",
        "tabs",
        "tabData",
    ]);
    useEffect(() => {
        // const currentUrl = `${pathname}?${query.toString()}`
        let tabData: FormProps["tabData"] = {};
        let cTab = null;
        let defaultTab = null;
        console.log(tabs);

        Object.entries(tabs).map(([k, v]) => {
            const newSearchParams = new URLSearchParams(query?.toString());
            newSearchParams.delete("_page");
            newSearchParams.delete(v.qk);
            let tabName = v.tabName || v.children;
            if (v.qk) {
                const qv = query.get(v.qk);
                if (qv == v.qv) {
                    cTab = tabName;
                }
                newSearchParams.set(v.qk, v.qv);
                newSearchParams.set(v.qk, v.qv || null);
            } else {
                defaultTab = tabName;
            }
            const url = `${pathname}?${!v.qk ? "" : newSearchParams.toString()}`
                ?.split("?")
                ?.filter(Boolean)
                ?.join("?");

            tabData[tabName] = {
                current: cTab == tabName,
                url,
            };
        });
        if (!cTab && defaultTab) {
            tabData[defaultTab].current = true;
        }
        form.setValue("tabData", tabData);
    }, [query, tabs]);
    return {
        register(props: TabProps) {
            if (props.tabName || props.children)
                form.setValue(
                    `tabs.${props.tabName || props.children}` as any,
                    {
                        ...props,
                    }
                );
        },
        tabs,
        tabData,
        currentTab,
    };
};
const ctx = createContext<ReturnType<typeof useCtx>>({} as any);
function _FPageTabs({ children }: Props) {
    const _values = useCtx();
    return (
        <ctx.Provider value={_values}>
            <FContentShell className="border-b flex-1 ">
                {children}
            </FContentShell>
        </ctx.Provider>
    );
}

interface TabProps {
    children?: any;
    tabName?: string;
    href?: string;
    query?: {
        k?: string;
        v?: string;
    }[];
    qk?: string;
    qv?: string;
}
function Tab(props: TabProps) {
    const ct = useContext(ctx);
    useEffect(() => {
        ct.register(props);
    }, []);
    return (
        <Button
            variant={"ghost"}
            size="sm"
            className={cn(
                ct.tabData?.[props.tabName || props.children]?.current
                    ? "border-b-2 border-blue-600 rounded-none"
                    : "text-muted-foreground"
            )}
            asChild
            disabled={ct.tabData?.[props.tabName || props.children]?.current}
        >
            <Link
                className={cn("inline-flex items-center space-x-2")}
                href={ct.tabData?.[props.tabName || props.children]?.url || ""}
            >
                {props.children}
            </Link>
        </Button>
    );
}

export let FPageTabs = Object.assign(_FPageTabs, {
    Tab,
});
