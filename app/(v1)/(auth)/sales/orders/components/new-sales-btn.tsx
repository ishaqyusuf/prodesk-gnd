"use client";

import {
    Menu,
    MenuItem,
} from "@/components/_v1/data-table/data-table-row-actions";
import { Icons } from "@/components/_v1/icons";

export default function NewSalesBtn({}) {
    return (
        <>
            <Menu label="New" variant={"default"} Icon={Icons.add}>
                <MenuItem href={"/sales/edit/order/new"}>Sales Form</MenuItem>
                <MenuItem href={"/sales-v2/form/new"}>
                    Sales Form 2 (Test Mode)
                </MenuItem>
            </Menu>
        </>
    );
}
