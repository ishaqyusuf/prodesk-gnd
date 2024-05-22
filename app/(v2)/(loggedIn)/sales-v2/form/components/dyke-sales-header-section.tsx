"use client";
import { useDykeForm } from "../_hooks/form-context";
import Btn from "@/components/_v1/btn";
import { _revalidate } from "@/app/(v1)/_actions/_revalidate";
import useDykeFormSaver from "../_hooks/use-dyke-form-saver";
import {
    CopyOrderMenuAction,
    PrintOrderMenuAction,
} from "@/components/_v1/actions/order-actions";
import { Icons } from "@/components/_v1/icons";
import { Menu } from "@/components/_v1/data-table/data-table-row-actions";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import useScroll from "@/hooks/use-scroll";
import { useModal } from "@/components/common/modal/provider";
import SalesNoteModal from "../../components/_sales-note/_modal";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/_v1/date-range-picker";

export default function HeaderSection({}) {
    const form = useDykeForm();
    const [orderId, id, type, slug, date] = form.getValues([
        "order.orderId",
        "order.id",
        "order.type",
        "order.slug",
        "order.createdAt",
    ]);
    const saver = useDykeFormSaver(form);
    const scroll = useScroll((scrollY) => scrollY > 200);
    const modal = useModal();
    return (
        <div className="h-12">
            <div
                className={cn(
                    "flex h-12 items-center",
                    scroll.isScrolled &&
                        "fixed  top-0  right-0 left-0 grid  lg:grid-cols-[240px_minmax(0,1fr)] z-10 "
                )}
            >
                {scroll.isScrolled && <div></div>}
                <div
                    className={cn(
                        "flex justify-between flex-1  items-center",
                        scroll.isScrolled &&
                            "bg-white py-2   shadow-sm border-b px-8"
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
                        <div className="inline-flex items-center space-x-2">
                            <Label>Date:</Label>
                            <DatePicker
                                disabled={(date) => date > new Date()}
                                setValue={(e) =>
                                    form.setValue("order.createdAt", e)
                                }
                                className="w-auto h-8"
                                value={date}
                            />
                        </div>
                        <Btn
                            size="sm"
                            variant={"outline"}
                            onClick={() => {
                                // modal.openSheet(
                                //     <SalesNoteModal id={id} orderId={orderId} />
                                // );
                            }}
                        >
                            Payments
                        </Btn>
                        <Btn
                            size="sm"
                            variant={"outline"}
                            onClick={() => {
                                modal.openSheet(
                                    <SalesNoteModal id={id} orderId={orderId} />
                                );
                            }}
                        >
                            Notes
                        </Btn>
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
                            <CopyOrderMenuAction row={{ slug, id } as any} />
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
