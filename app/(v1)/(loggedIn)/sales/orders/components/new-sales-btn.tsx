"use client";

import {
    Menu,
    MenuItem,
} from "@/components/_v1/data-table/data-table-row-actions";
import { Icons } from "@/components/_v1/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewSalesBtn({}) {
    const btns = [
        { text: "Old", href: "/sales/edit/order/new" },
        { text: "New", href: "/sales-v2/form/order" },
    ];
    return (
        <div className="flex space-x-2">
            {btns.map((b) => (
                <Button
                    key={b.text}
                    size="sm"
                    variant={b.text == "Old" ? "outline" : "default"}
                    asChild
                >
                    <Link href={b.href}>
                        <Icons.add className="w-4 h-4 mr-2" />
                        <span>{b.text}</span>
                    </Link>
                </Button>
            ))}
            {/* <Menu label="New" variant={"default"} Icon={Icons.add}>
                <MenuItem href={"/sales/edit/order/new"}>Sales Form</MenuItem>
                <MenuItem href={"/sales-v2/form/order"}>Sales Form 2</MenuItem>
            </Menu> */}
        </div>
    );
}
