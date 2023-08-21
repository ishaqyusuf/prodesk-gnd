"use client";

import { PrimitiveDivProps } from "@radix-ui/react-tabs";
import Link from "next/link";

export default function LinkableNode({
  href,
  As,
  children,
  ...props
}: PrimitiveDivProps & { href?; As? }) {
  if (href)
    return (
      <Link {...(props as any)} href={href}>
        {children}
      </Link>
    );
  return <div {...props}>{children}</div>;
}
