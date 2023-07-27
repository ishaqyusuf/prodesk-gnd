"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import SiteHeader from "@/components/layouts/site-header";
import { nav } from "@/lib/navs";
import SideNav from "@/components/layouts/side-nav";

export default function AccountLayout({ children }: any) {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/signin");
    },
  });

  if (!session?.user) return <></>;
  let sb = nav(session);
  if (!sb) return;
  return (
    <div
      className={`${!sb.noSideBar &&
        "md:grid-cols-[220px_minmax(0,1fr)]   lg:grid-cols-[240px_minmax(0,1fr)]"} md:grid `}
    >
      {!sb.noSideBar && (
        <SideNav
          nav={sb}
          className="fixed top-0 z-30 -ml-2 hidden h-[calc(100vh)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block"
        />
      )}
      <main className="">
        <SiteHeader nav={sb} />
        <div
          className={cn(
            "relative py-4 lg:gap-10 2xl:grid 2xl:grid-cols-[1fr_300px]"
          )}
        >
          <div className="mx-auto w-full min-w-0">{children}</div>
        </div>
      </main>
    </div>
  );
}
