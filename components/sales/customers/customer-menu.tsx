"use client";

import { Menu, MenuItem } from "@/components/data-table/data-table-row-actions";
import { Banknote, Plus, ShoppingBag } from "lucide-react";
interface Props {
    customer;
}
export default function CustomerMenu({ customer }: Props) {
    return (
        <Menu label="New" variant="secondary" Icon={Plus}>
            <MenuItem
                Icon={Banknote}
                href={`/sales/estimate/new/form?customerId=${customer.id}`}
            >
                Estimates
            </MenuItem>
            <MenuItem
                Icon={ShoppingBag}
                href={`/sales/order/new/form?customerId=${customer.id}`}
            >
                Order
            </MenuItem>
        </Menu>
    );
}
