"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { siteNavStore } from "./store";
import { navModules } from "./utils";

export function ModuleSwitcher({}) {
    const { isMobile } = useSidebar();
    // const [activeTeam, setActiveTeam] = React.useState(teams[0]);
    const store = siteNavStore();
    const teams = store.modules.filter((m) => m.linkCount);
    const activeModule = navModules?.[store?.activeModule];
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                {activeModule?.Icon && (
                                    <activeModule.Icon className="size-4" />
                                )}
                                {/* <activeTeam.logo className="size-4" /> */}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {activeModule?.title}
                                </span>
                                <span className="truncate text-xs">
                                    {/* {activeTeam.plan} */}
                                    gnd-prodesk
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Modules
                        </DropdownMenuLabel>
                        {teams.map((team, index) => (
                            <DropdownMenuItem
                                key={team.title}
                                href={team.mainRoute}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    <team.Icon className="size-4 shrink-0" />
                                </div>
                                {team.title}
                                <DropdownMenuShortcut>
                                    ⌘{index + 1}
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        {/* <DropdownMenuItem className="gap-2 p-2">
                            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                <Plus className="size-4" />
                            </div>
                            <div className="font-medium text-muted-foreground">
                                Add team
                            </div>
                        </DropdownMenuItem> */}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
