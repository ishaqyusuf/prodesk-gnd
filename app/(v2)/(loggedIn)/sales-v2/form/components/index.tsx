"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { SalesItemForm } from "./item-form";

interface Props {}
export default function SalesFormComponent({}: Props) {
    const [open, setOpen] = useState<any>("0");
    const form = useForm({
        defaultValues: {
            items: {
                "0": {
                    meta: {
                        configIndex: 0,
                    },
                },
            },
        },
    });
    const [itemsIndex, setItemIndex] = useState([0]);
    return (
        <div>
            {itemsIndex.map((i) => (
                <SalesItemForm
                    key={i}
                    form={form}
                    rowIndex={i.toString()}
                    openIndex={open}
                    setOpen={(e) => {
                        if (e) setOpen(i.toString());
                        else if (!e && open == i.toString()) setOpen(null);
                    }}
                />
            ))}
        </div>
    );
}
