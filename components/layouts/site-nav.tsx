"use client";
import { Button } from "@/components/ui/button";
import { ISidebar } from "@/lib/navs";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "../icons";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  nav: ISidebar;
}

export default function SiteNav({ className, onClick, nav }: SidebarProps) {
  //   const [routes, setRoutes] = useState<any>([]);
  //   useEffect(() => {
  //       //     setRoutes(useSidebarRoutes(session));
  //   }, [session?.user?.id]);
  const pathname = usePathname();
  function routeBtn(route: { icon: any; path: string; title: string }, i) {
    const isActive = pathname?.startsWith(route.path);
    return (
      <Button
        key={i}
        asChild
        variant={isActive ? "outline" : "ghost"}
        size="sm"
        className={`w-full justify-start ${isActive ? "bg-accent" : ""}`}
      >
        <Link onClick={onClick as any} href={route.path}>
          {route.icon && <route.icon className="mr-2 h-4 w-4" />}
          {route.title}
        </Link>
      </Button>
    );
  }
  return (
    <aside className={cn("border-r pb-12", className)}>
      <div className="mx-4 mt-2">
        <Icons.logoLg />
      </div>
      <div className="space-y-4 py-4">
        {nav.routeGroup.map((route, index) => {
          if (!route?.title && route?.routes?.length > 1)
            return (
              <div key={index} className="-mb-4 px-4">
                {route.routes?.map((cr, i) => routeBtn(cr, i))}
              </div>
            );
          return (
            <div key={index} className="py-1s px-4">
              <h2 className="mb-2 pr-2 text-sm font-semibold tracking-tight text-muted-foreground">
                {route.title}
              </h2>
              <div className="space-y-1">
                {route.routes?.map((cr, i) => routeBtn(cr, i))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
