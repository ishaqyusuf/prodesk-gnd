import { MenuItem } from "@/components/_v1/data-table/data-table-row-actions";
import { Icons } from "@/components/_v1/icons";
import {
    DropdownMenuGroup,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import React, { useEffect, useState } from "react";
import { IStepProducts } from ".";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductImage } from "./product";

export default function DoorMenuOption({ setStepProducts, products }) {
    const [prods, setProds] = useState([]);
    useEffect(() => {
        setProds(
            (products as IStepProducts)
                .map((product) => {
                    let pricings = product.product?.meta?.doorPrice || {};
                    let importables = [
                        { title: "All", count: 0, filter: null },
                    ];
                    let heights = Array.from(
                        new Set(
                            Object.keys(pricings).map(
                                (k) => k.split(" ").reverse()[0]
                            )
                        )
                    );
                    let prices = Object.entries(pricings).map(([a, b]) => ({
                        height: a.split(" ").reverse()[0],
                        price: b,
                        size: a,
                    }));
                    heights.map((h) => {
                        let count = prices.filter(
                            (a) => a.height == h && a.price
                        ).length;
                        importables[0].count += count;
                        if (count)
                            importables.push({
                                title: h,
                                count,
                                filter: h,
                            });
                    });
                    // console.log({ pricings });
                    // return {
                    //     title: product.door?.title,
                    // };
                    console.log({ img: product?.door?.img });
                    return {
                        importables,
                        doorImg: product?.door?.img,
                        id: product.id,
                        title: product.door?.title,
                    };
                })
                .filter((a) => a.importables[0]?.count)
        );
    }, []);
    return (
        <React.Fragment>
            <MenuItem
                Icon={Icons.copy}
                // onClick={() => {
                //     modal.open();
                // }}
                SubMenu={
                    <>
                        <DropdownMenuLabel>Select Door</DropdownMenuLabel>
                        <ScrollArea className="h-[40vh]">
                            {prods.map((p, i) => (
                                <MenuItem
                                    key={i}
                                    SubMenu={
                                        <>
                                            <DropdownMenuLabel>
                                                Size
                                            </DropdownMenuLabel>
                                            <div className="flex">
                                                <div className="w-36">
                                                    {p.importables.map((i) => (
                                                        <MenuItem
                                                            className="flex justify-between"
                                                            key={i.title}
                                                        >
                                                            <span>
                                                                {" "}
                                                                {i.title}
                                                            </span>
                                                            <span className="text-xs font-bold inline-flex items-center space-x-1">
                                                                <Icons.dollar className="w-3 h-3" />
                                                                <span>
                                                                    {i.count}
                                                                </span>
                                                            </span>
                                                        </MenuItem>
                                                    ))}
                                                </div>
                                                <div className="w-48 h-48">
                                                    <ProductImage
                                                        aspectRatio={4 / 4}
                                                        item={{
                                                            product: {
                                                                img: p.doorImg,
                                                            },
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    }
                                >
                                    {p.title}
                                </MenuItem>
                            ))}
                        </ScrollArea>
                        {/* <MenuItem
                            SubMenu={
                                <>
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel>
                                            Label
                                        </DropdownMenuLabel>
                                    </DropdownMenuGroup>
                                    <MenuItem>All Sizes</MenuItem>
                                    <MenuItem>8-0</MenuItem>
                                </>
                            }
                        >
                            Door 1
                        </MenuItem> */}
                    </>
                }
            >
                Copy Price
            </MenuItem>
        </React.Fragment>
    );
}
