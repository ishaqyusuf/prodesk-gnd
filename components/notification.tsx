"use client";

import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useState } from "react";
import { Badge } from "./ui/badge";

export default function Notification({}) {
  const [newNotificationCount, setNewNotificationCount] = useState(1);
  const [notifications, setNotifications] = useState([]);
  async function loadNotifications() {}
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Notification"
            variant="outline"
            size="sm"
            className={`rounded-full relative  space-x-2 ${newNotificationCount >
              0 && "p-1"}`}
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            {newNotificationCount > 0 && (
              <Badge variant="default" className="">
                {newNotificationCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    </div>
  );
}
