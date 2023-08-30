"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { nav } from "@/lib/navs";

export default function CommunitySettingsLayoutComponent({
  children,
}: {
  children;
}) {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/signin");
    },
  });
  const _nav = nav(session);
  const path = usePathname();
  const [tab, setTab] = useState<any>(path);
  const [tabs, setTabs] = useState<{ label; value }[]>([]);
  const route = useRouter();
  return (
    <div className="space-y-4 px-8">
      <Tabs
        defaultValue={tab}
        onChange={(v) => {
          console.log(v);
        }}
        className="space-y-4"
      >
        <TabsList>
          {_nav?.CommunitySettings.map((c, i) => (
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
      {children}
    </div>
  );
}
