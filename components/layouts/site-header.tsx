"use client";
import { cn } from "@/lib/utils";
import { Icons } from "../icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { ISidebar } from "@/lib/navs";
export default function SiteHeader({ nav }: { nav: ISidebar }) {
  const { data: session } = useSession();

  const name = session?.user?.name;
  const initials = `${name?.charAt(0) ?? ""} ${name?.charAt(1) ?? ""}`;
  return (
    <header
      className={cn(
        `flex h-14 items-center border-b px-4`,
        nav.noSideBar && "lg:px-16"
      )}
    >
      <div className={cn(!nav.noSideBar && "md:hidden", "mr-4  h-10 w-10")}>
        <Icons.logo />
      </div>
      <div id="breadCrumbs" className="flex items-center space-x-1">
        {/* <Breadcrumbs segments={navs} /> */}
      </div>
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage
                // src="https://ui-avatars.com/api/?background=0D8ABC&color=fff"
                alt="@shadcn"
              />
              {/* <AvatarImage src="/avatars/03.png" alt="@shadcn" /> */}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session?.user?.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {nav.noSideBar &&
            nav.routeGroup.map((rg, index) => (
              <DropdownMenuGroup key={index}>
                {rg?.routes?.map((r, index2) => (
                  <Link href={`${r?.path}`} key={index2}>
                    <DropdownMenuItem>
                      <r.icon className="mr-2 h-4 w-4" />
                      <span>{r.title}</span>
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuGroup>
            ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              signOut();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
