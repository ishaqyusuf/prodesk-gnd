"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { siteNavStore } from "./store";
import { Fragment } from "react";
import DevOnly from "@/_v2/components/common/dev-only";
export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon?: LucideIcon;
        isActive?: boolean;
        items?: {
            title: string;
            url: string;
        }[];
    }[];
}) {
    const navStore = siteNavStore();
    const navs = navStore?.modules?.find(
        (m) => m?.moduleName == navStore?.activeModule
    );
    console.log(navs);

    return (
        <SidebarGroup>
            {navs?.groupMenu
                // ?.filter((gm) => gm.visibleLinks)
                ?.map((gm, i) => (
                    <Fragment key={i}>
                        <SidebarGroupLabel>{gm.title}</SidebarGroupLabel>
                        <SidebarMenu>
                            {gm.links.map((l, i) => (
                                <SidebarMenuItem key={i}>
                                    <SidebarMenuButton asChild>
                                        <a href={l.path}>
                                            {l.Icon && <l.Icon />}
                                            <span>{l.name}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </Fragment>
                ))}

            <DevOnly>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>
                    {items.map((item) => (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={item.isActive}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={item.title}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items?.map((subItem) => (
                                            <SidebarMenuSubItem
                                                key={subItem.title}
                                            >
                                                <SidebarMenuSubButton asChild>
                                                    <a href={subItem.url}>
                                                        <span>
                                                            {subItem.title}
                                                        </span>
                                                    </a>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    ))}
                </SidebarMenu>
            </DevOnly>
        </SidebarGroup>
    );
}
