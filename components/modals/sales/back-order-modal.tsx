"use client";

import React, { useState, useTransition } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { ISalesOrder } from "@/types/sales";
import { _useAsync } from "@/lib/use-async";
import BaseModal from "../base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";
import { SecondaryCellContent } from "@/components/columns/base-columns";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
// import { UseFormReturn } from "react-hook-form/dist/types";

export default function BackOrderModal() {
    const [pending, startTransition] = useTransition();
    async function save(order) {
        startTransition(async () => {
            closeModal();
            router.refresh();
            toast.success("Production Assigned!");
        });
    }

    const router = useRouter();
    const [tab, setTab] = useState("main");
    return (
        <BaseModal<ISalesOrder>
            className="sm:max-w-[650px]"
            onOpen={order => {}}
            onClose={() => {}}
            modalName="backOrder"
            Title={({ data: order }) => <div className="">Back Order</div>}
            Subtitle={({ data }) => (
                <div>
                    {" #"}
                    {data?.orderId} {data?.customer?.name}
                </div>
            )}
            Content={({ data }) => (
                <Tabs defaultValue={tab} className="">
                    <TabsContent value="main">
                        <div className="    -mx-4 sm:mx-0">
                            <ScrollArea
                                id="employees"
                                className="max-h-[350px] hidden sm:block w-full"
                            >
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="px-1"></TableHead>
                                            <TableHead className="px-1">
                                                Items
                                            </TableHead>
                                            <TableHead className="px-1">
                                                Qty
                                            </TableHead>
                                            <TableHead className="px-1">
                                                Back Qty
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data?.items?.map((field, i) => (
                                            <TableRow key={field.id}>
                                                <TableCell>
                                                    <Checkbox />
                                                </TableCell>
                                                <TableCell
                                                    className={"p-0 px-1"}
                                                >
                                                    <p className="text-primary">
                                                        {field.description}
                                                    </p>
                                                </TableCell>
                                                <TableCell
                                                    className={"p-0 px-1"}
                                                >
                                                    <p className="text-primary">
                                                        {field.qty}
                                                    </p>
                                                    <SecondaryCellContent>
                                                        {field.prebuiltQty}{" "}
                                                        completed
                                                    </SecondaryCellContent>
                                                </TableCell>
                                                <TableCell
                                                    className={"p-0 px-1"}
                                                >
                                                    <Input className="w-12 h-7" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                            <div className="flex justify-end">
                                <Button>Proceed</Button>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="invoice"></TabsContent>
                </Tabs>
            )}
        />
    );
}
