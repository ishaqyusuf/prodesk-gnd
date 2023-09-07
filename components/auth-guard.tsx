"use client";

import { ICan } from "@/types/auth";
import { PrimitiveDivProps } from "@radix-ui/react-tabs";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface Props {
  permissions: (keyof ICan)[];
  children?;
}
export default function AuthGuard({ permissions, children }: Props) {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/signin");
    },
  });
  const [visible, setVisible] = useState(
    permissions.every((v) => session?.can?.[v])
  );
  return <>{visible && children}</>;
}
