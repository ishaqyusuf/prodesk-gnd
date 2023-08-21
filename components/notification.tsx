"use client";

import { AlertTriangle, Archive, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "./ui/dropdown-menu";
import React, { useEffect, useState, useTransition } from "react";
import { Badge } from "./ui/badge";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { cn } from "@/lib/utils";
import {
  INotification,
  archiveAction,
  getNotificationCountAction,
  loadNotificationsAction,
  markAsReadAction,
} from "@/app/_actions/notifications";
import { ToolTip } from "./tool-tip";
import Link from "next/link";
import dayjs from "@/lib/dayjs";
import Btn from "./btn";
import { useAppSelector } from "@/store";
import { dispatchSlice } from "@/store/slicers";
import { deepCopy } from "@/lib/deep-copy";
import { ScrollArea } from "./ui/scroll-area";
import LinkableNode from "./link-node";

export default function Notification({}) {
  const [notificationCount, setNotificationCount] = useState(0);

  const notifications = useAppSelector((state) => state.slicers?.notifications);
  useEffect(() => {
    // Fetch notification count from the server
    const fetchNotificationCount = async () => {
      const count = await getNotificationCountAction();
      setNotificationCount(count as any);
    };
    fetchNotificationCount();
    const intervalId = setInterval(fetchNotificationCount, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open) loadNotifications();
  }, [open]);
  async function loadNotifications() {
    const list = await loadNotificationsAction();
    const items = list.map((item) => {
      const { archivedAt, createdAt, updatedAt, ..._item } = item;
      _item.time = dayjs(createdAt).fromNow();
      _item.archived = archivedAt != null;
      return _item;
    });
    dispatchSlice("notifications", items);
  }
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
          className="w-[400px] bg-white relative shadow-xl rounded-lg z-[999]"
        >
          <Tabs defaultValue="inbox" className="">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="archive">Archive</TabsTrigger>
            </TabsList>
            <TabsContent value="inbox">
              <NotificationList type="inbox" />
              <div className="flex border-t justify-center items-center p-2">
                <Button variant="ghost">Archive All</Button>
              </div>
            </TabsContent>
            <TabsContent value="archive">
              <NotificationList type="archive" />
            </TabsContent>
          </Tabs>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
function NotificationList({ type }: { type: "inbox" | "archive" }) {
  const notifications = useAppSelector((state) => state.slicers.notifications);

  return (
    <ScrollArea className="max-h-[350px] min-h-[300px] ">
      <div className="divide-y">
        {notifications?.map((item, index) => (
          <NotificationItem type={type} key={index} index={index} item={item} />
        ))}
      </div>
    </ScrollArea>
  );
}
function NotificationItem({
  item,
  index,
  type,
}: {
  item: INotification;
  index;
  type;
}) {
  const visible = type == "inbox" ? !item.archived : item.archived;
  const notifications = useAppSelector((state) => state.slicers.notifications);
  const [archiving, startTransition] = useTransition();
  if (!visible) return null;
  function archive() {
    startTransition(async () => {
      await archiveAction(item.id);
      let len = notifications.length;
      dispatchSlice("notifications", [
        ...notifications.slice(0, len - index),
        {
          ...deepCopy(item),
          archived: true,
        },
        ...notifications.slice(index + 1),
      ]);
    });
  }
  let Node = item?.link ? Link : React.Component;
  return (
    <div className="relative" key={item.id}>
      <Button variant="ghost" className=" w-full h-full p-4">
        <LinkableNode
          href={item.link as any}
          onClick={async () => {
            await markAsReadAction(item.id);
          }}
          className="mr-10 flex w-full items-center justify-start text-start"
        >
          <div className="h-9 w-9">
            <AlertTriangle className="text-yellow-600" />
          </div>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium">{item.message}</p>
            <p className="text-sm text-muted-foreground">{item.time}</p>
          </div>
        </LinkableNode>
      </Button>
      {type == "inbox" && (
        <div className="ml-auto absolute right-0 top-0 m-4 font-medium">
          <ToolTip info="Archive">
            <Btn
              isLoading={archiving}
              onClick={archive}
              variant="secondary"
              size="icon"
            >
              <Archive className="w-4 h-4" />
            </Btn>
          </ToolTip>
        </div>
      )}
    </div>
  );
}
