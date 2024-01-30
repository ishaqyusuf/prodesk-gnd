"use server";

import { getHousePackageTool } from "./get-house-package-tool";

export async function getDimensionSizeList(height) {
    const d = await getHousePackageTool();
    console.log(d);
    const list: {
        dim: string;
        width: string;
    }[] = [];
    const heightIn = d.data.sizes.find((s) => s.ft == height && s.height)?.in;
    if (!heightIn) return [];

    d.data.sizes.map((size) => {
        if (size.width)
            list.push({
                dim: `${size.in} x ${heightIn}`.replaceAll('"', "in"),
                width: size.ft,
            });
    });
    return list.sort((a, b) =>
        b.width.toLowerCase() > a.width.toLowerCase() ? -1 : 1
    );
}
