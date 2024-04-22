"use server";

import { inToFt } from "@/lib/utils";
import { getHousePackageTool } from "./get-house-package-tool";

export async function getDimensionSizeList(height, _bifold) {
    const d = await getHousePackageTool();
    console.log(d);
    const list: {
        dim: string;
        width: string;
    }[] = [];
    const heightIn =
        d.data.sizes.find((s) => s.ft == height && s.height)?.in ||
        inToFt(height);

    // if (!heightIn) return [];

    d.data.sizes
        .filter((s) => (_bifold ? s.type == "Bifold" : s.type != "Bifold"))
        .map((size) => {
            if (size.width)
                list.push({
                    dim: `${size.in} x ${heightIn}`.replaceAll('"', "in"),
                    width: size.ft,
                });
        });
    return list.sort((a, b) => {
        // Split each element of the array by '-' to separate the numbers
        let [aFirst, aSecond] = a.width.split("-").map(Number) as any;
        let [bFirst, bSecond] = b.width.split("-").map(Number) as any;

        // Compare the first numbers
        if (aFirst !== bFirst) {
            return aFirst - bFirst;
        }

        // If the first numbers are equal, compare the second numbers
        return aSecond - bSecond;
    });
    // return list.sort((a, b) =>
    //     b.width.toLowerCase() > a.width.toLowerCase() ? -1 : 1
    // );
}
