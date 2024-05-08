"use client";
import { useDykeForm } from "../_hooks/form-context";
import Btn from "@/components/_v1/btn";
import { _revalidate } from "@/app/(v1)/_actions/_revalidate";
import useDykeFormSaver from "../_hooks/use-dyke-form-saver";
import { PrintOrderMenuAction } from "@/components/_v1/actions/order-actions";
import { Icons } from "@/components/_v1/icons";
import { Menu } from "@/components/_v1/data-table/data-table-row-actions";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import useScroll from "@/hooks/use-scroll";

export default function HeaderSection({}) {
    const form = useDykeForm();
    const [orderId, id, type] = form.getValues([
        "order.orderId",
        "order.id",
        "order.type",
    ]);
    const saver = useDykeFormSaver(form);
    const scroll = useScroll((scrollY) => scrollY > 200);
    return (
        <div className="h-10">
            <div
                className={cn(
                    "flex h-10 items-center",
                    scroll.isScrolled &&
                        "fixed top-0  right-0 left-0 grid lg:grid-cols-[240px_minmax(0,1fr)]"
                )}
            >
                {scroll.isScrolled && <div></div>}
                <div
                    className={cn(
                        "flex justify-between  items-center",
                        scroll.isScrolled &&
                            "bg-white   shadow-sm border-b px-8"
                    )}
                >
                    {/* <div className=""></div> */}
                    <div className="">
                        <h2 className="text-2xl font-bold tracking-tight">
                            {orderId && id && type == "order"
                                ? "SALES #:"
                                : "QUOTE #:"}{" "}
                            {orderId || "New"}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Btn
                            size="sm"
                            isLoading={saver.saving}
                            onClick={() => form.handleSubmit(saver.save)()}
                        >
                            Save
                        </Btn>
                        <Menu Icon={Icons.more}>
                            {/* <MenuItem
                        onClick={() => {
                            openModal("salesSupply");
                        }}
                    >
                        Supply
                    </MenuItem> */}
                            <PrintOrderMenuAction
                                link
                                row={
                                    {
                                        slug: form.getValues("order.slug"),
                                    } as any
                                }
                            />
                            <PrintOrderMenuAction
                                mockup
                                link
                                row={
                                    {
                                        slug: form.getValues("order.slug"),
                                    } as any
                                }
                            />
                            <PrintOrderMenuAction
                                pdf
                                row={
                                    {
                                        slug: form.getValues("order.slug"),
                                    } as any
                                }
                            />
                        </Menu>
                    </div>
                </div>
            </div>
        </div>
    );
}
