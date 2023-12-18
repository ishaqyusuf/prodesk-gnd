"use client";

import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { IDykeSalesItem } from "../../type";

interface Props {
    form: UseFormReturn<{ items: IDykeSalesItem[] }>;
    itemIndex;
}

export default function ShelfItemsBlock({ form, itemIndex }: Props) {
    const configky = `items.${itemIndex}.meta.shelfItem`;

    useEffect(() => {
        const oldf = form.getValues(configky as any);
        if (!oldf) {
            form.setValue(configky as any, {
                categoryIds: [],
                productId: null,
                price: null,
                title: null,
            });
        }
    }, []);
    return <div></div>;
}
