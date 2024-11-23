import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon, PanelsTopLeft } from "lucide-react";
import Link from "next/link";
import Menu from "./menu";
import { useStore } from "@/app/(clean-code)/_common/hooks/use-store";
import { useSidebarToggle } from "@/app/(clean-code)/_common/hooks/use-sidebar-toggle";
import { Icons } from "@/components/_v1/icons";
import { cn } from "@/lib/utils";

export function SheetMenu() {
    const sidebar = useStore(useSidebarToggle, (state) => state);
    return (
        <Sheet>
            <SheetTrigger className="lg:hidden" asChild>
                <Button className="h-8" variant="outline" size="icon">
                    <MenuIcon size={20} />
                </Button>
            </SheetTrigger>
            <SheetContent
                className="sm:w-72 px-3 h-full flex flex-col"
                side="left"
                aria-describedby={undefined}
            >
                <SheetHeader>
                    <SheetTitle className="w-full" asChild>
                        <Button
                            className={cn(
                                "transition-transform ease-in-out duration-300 mb-1",
                                sidebar?.isOpen === false
                                    ? "translate-x-1"
                                    : "translate-x-0"
                            )}
                            variant="ghost"
                            asChild
                        >
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2"
                            >
                                {!sidebar?.isOpen ? (
                                    <Icons.logo />
                                ) : (
                                    <Icons.logoLg />
                                )}
                            </Link>
                        </Button>
                    </SheetTitle>
                </SheetHeader>
                <Menu isOpen />
            </SheetContent>
        </Sheet>
    );
}
