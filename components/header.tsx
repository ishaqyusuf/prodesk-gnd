import { ISidebar } from "@/lib/side-bar";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { Icons } from "./icons";
import { Breadcrumbs } from "./pagers/breadcrumbs";
import { INav } from "./side-bar";
import { UserNav } from "./user-nav";

export default function Header({ nav }: { nav: ISidebar }) {
  const navs = useAppSelector((state) => state.headerSlice.navs);
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
      <div className="flex items-center space-x-1">
        <Breadcrumbs segments={navs} />
      </div>
      <div className="flex-1" />
      <UserNav />
    </header>
  );
}
