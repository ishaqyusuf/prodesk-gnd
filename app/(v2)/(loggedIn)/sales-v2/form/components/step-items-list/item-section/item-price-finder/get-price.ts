"use server";

import { prisma } from "@/db";
import { ItemPriceFinderProps } from ".";
import { camel } from "@/lib/utils";
type Keys = "dykeDoorId" | "moldingId" | "casingId" | "jambSizeId";
export async function getDoorPrices({ ...props }: ItemPriceFinderProps) {
    function _or(key: Keys) {
        if (props[key])
            return {
                [key]: props[key],
            };
        return null;
    }
    const doors = await prisma.dykeSalesDoors.findMany({
        where: {
            dimension: props.dimension,
            housePackageTool: {
                OR: [
                    _or("dykeDoorId"),
                    _or("moldingId"),
                    _or("casingId"),
                    _or("jambSizeId"),
                ].filter(Boolean) as any,
            },
        },
        include: {
            housePackageTool: true,
        },
    });
    // console.log(doors);

    function getPricings(key: Keys) {
        let title = {
            moldingId: "Moulding",
            dykeDoorId: "Door",
            casingId: "Casing",
            jambSizeId: "Jamb Size",
        }[key];
        let priceKey = `${camel(title == "Moulding" ? "Door" : title)}Price`;

        const pDoors = doors.filter(
            (d) => d.housePackageTool?.[key] == props[key] && props[key]
        );
        return {
            title,
            priceKey,
            priceList: pDoors
                .filter(
                    (p, i) =>
                        pDoors.findIndex((s) => s[priceKey] == p[priceKey]) ==
                            i && p[priceKey] > 0
                )
                .map((p) => ({
                    date: p.createdAt,
                    value: p[priceKey],
                })),
        };
    }
    const priceTabs = props.moldingId
        ? [getPricings("moldingId")]
        : [
              getPricings("dykeDoorId"),

              getPricings("casingId"),
              getPricings("jambSizeId"),
          ];
    console.log(priceTabs);

    // return priceTabs;
    return {
        priceTabs,
        hasPrice: priceTabs.some((p) => p.priceList.length),
    };
}
