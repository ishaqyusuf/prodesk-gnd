"use client";

import { ICan } from "@/types/auth";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type AuthPermissions = (keyof ICan | (keyof ICan)[])[];
interface Props {
    can?: AuthPermissions;
    roles?: string[];
    children?;
    className?;
}
export default function AuthGuard({
    can = [],
    className,
    children,
    roles = [],
}: Props) {
    const { data: session } = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/login");
        },
    });

    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const permission =
            !can.length ||
            can?.every((v) =>
                Array.isArray(v)
                    ? v.some((p) => session?.can?.[p])
                    : session?.can?.[v]
            );
        const rolePermission =
            !roles.length || roles?.some((r) => r == session?.role?.name);

        const _visible =
            (permission && rolePermission) || session?.role.name == "Admin";
        setVisible(_visible);
        if (!_visible) {
            console.log("REDIRECTED!!!");
            // redirect("/");
        }
        console.log("____||}}}}");
    }, []);

    return <div className={cn(className)}>{visible && children}</div>;
}
