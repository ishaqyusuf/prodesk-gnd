"use client";

import { ISlicer } from "@/store/slicers";
import { useEffect, useState } from "react";
import { DataTableFacetedFilter2 } from "./data-table-faceted-filter-2";

interface Props {
    table;
    listKey: keyof ISlicer;
    labelKey?;
    valueKey?;
    single?: Boolean;
    title;
    loader?;
    columnId;
}
export function DynamicFilter({
    table,
    columnId,
    loader,
    listKey,
    ...props
}: Props) {
    // if(!listKey) listKey = generateRandomString
    // const list = useAppSelector((state) => state.slicers?.[listKey as any]);
    const [items, setItems] = useState([]);
    useEffect(() => {
        console.log([columnId]);

        (async () => {
            const resp = await loader();
            setItems(resp);
        })();
    }, []);
    // useEffect(() => {
    //     // init();

    //     loadStaticList(listKey, list, loader);
    // }, [list, listKey, loader]);
    if (!items?.length) return <></>;
    return (
        <div>
            <DataTableFacetedFilter2
                column={table.getColumn(columnId)}
                {...props}
                options={(items as any)?.map((l) => {
                    return typeof l === "object" ? l : { label: l, value: l };
                })}
            />
        </div>
    );
}
