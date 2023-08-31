"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { nav } from "@/lib/navs";
import { Button } from "../ui/button";
import Link from "next/link";

export default function HrmLayout({ children }: { children }) {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/signin");
    },
  });
  const _nav = nav(session);
  const path = usePathname();
  const [tab, setTab] = useState<any>(path);
  // const [tabs, setTabs] = useState<{ label; value }[]>([]);
  const route = useRouter();
  return (
    <div className="space-y-4 ">
      <div className="hidden space-x-2">
        {_nav?.Hrm.map((c, i) => (
          <Button
            size="sm"
            className="p-2 h-8 px-4"
            variant={c.path == tab ? "default" : "link"}
            key={i}
            asChild
          >
            <Link href={c.path}>{c.title}</Link>
          </Button>
        ))}
      </div>
      <Tabs
        defaultValue={tab}
        onChange={(v) => {
          console.log(v);
        }}
        className=" px-8"
      >
        <TabsList>
          {_nav?.Hrm.map((c, i) => (
            <TabsTrigger
              onClick={() => {
                route.push(c.path);
              }}
              key={i}
              value={c.path}
            >
              {c.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="px-8">{children}</div>
    </div>
  );
}
