"use client";

import { AlertTriangle, Archive, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { cn } from "@/lib/utils";
import { getNotificationCountAction } from "@/app/_actions/notifications";
import { Notifications } from "@prisma/client";
import { ToolTip } from "./tool-tip";

export default function Notification({}) {
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notifications[]>([
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
  ] as any);
  useEffect(() => {
    // Fetch notification count from the server
    const fetchNotificationCount = async () => {
      const count = await getNotificationCountAction();
      setNotificationCount(count);
    };
    fetchNotificationCount();
    const intervalId = setInterval(fetchNotificationCount, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);
  const [open, setOpen] = useState(false);
  async function loadNotifications() {}
  return (
    <div>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Notification"
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full relative h-auto  space-x-2",
              notificationCount > 0 ? "p-1.5 px-2" : "p-1.5"
            )}
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            {notificationCount > 0 && (
              <Badge variant="default" className="p-0.5 leading-none px-1">
                {notificationCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[400px] bg-white relative shadow-lg z-[999]"
        >
          <Tabs defaultValue="inbox" className="">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="archive">Archive</TabsTrigger>
            </TabsList>
            <TabsContent value="inbox">
              <NotificationList list={notifications} />
              <div className="flex border-t justify-center items-center p-2">
                <Button variant="ghost">Archive All</Button>
              </div>
            </TabsContent>
            <TabsContent value="archive">
              {/* <SalesEmailSection /> */}
            </TabsContent>
          </Tabs>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
function NotificationList({ list }: { list: Notifications[] }) {
  return (
    <div className="divide-y">
      {list.map((item) => (
        <div className="relative" key={item.id}>
          <Button variant="ghost" className=" w-full h-full p-4">
            <div className="mr-10 flex w-full items-center justify-start text-start">
              <div className="h-9 w-9">
                <AlertTriangle />
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Olivia Martin
                </p>
                <p className="text-sm text-muted-foreground">5h ago</p>
              </div>
            </div>
          </Button>
          <div className="ml-auto absolute right-0 top-0 m-4 font-medium">
            <ToolTip info="Archive">
              <Button variant="secondary" size="icon">
                <Archive className="w-4 h-4" />
              </Button>
            </ToolTip>
          </div>
        </div>
      ))}
    </div>
  );
}
