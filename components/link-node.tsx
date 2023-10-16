"use client";

import { PrimitiveDivProps } from "@radix-ui/react-tabs";
import Link from "next/link";

export default function LinkableNode({
    href,
    As,
    children,
    _blank,
    ...props
}: PrimitiveDivProps & { href?; As?; _blank?: Boolean }) {
    if (href)
        return (
            <Link {...(props as any)} target={_blank && "_blank"} href={href}>
                {children}
            </Link>
        );
    return <div {...props}>{children}</div>;
}
