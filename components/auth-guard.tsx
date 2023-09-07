"use client";

import { ICan } from "@/types/auth";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  permissions: (keyof ICan)[];
  children?;
  className?;
}
export default function AuthGuard({ permissions, className, children }: Props) {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/signin");
    },
  });

  const [visible, setVisible] = useState(
    permissions.every((v) => session?.can?.[v])
  );
  return <div className={cn(className)}>{visible && children}</div>;
}
