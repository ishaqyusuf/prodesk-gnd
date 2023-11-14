"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/store";
import { ISalesOrder } from "@/types/sales";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import OrderInspection from "./order-inspection";

export default function LoadDelivery() {
    const dataPage = useAppSelector<{ id; data: ISalesOrder[] }>(
        s => s.slicers.dataPage
    );
    const form = useForm({
        defaultValues: {
            loader: {}
        }
    });
    const [currentTab, setCurrentTab] = useState<string>();
    useEffect(() => {
        setCurrentTab(dataPage.data?.[0]?.slug);
    }, [dataPage]);
    return (
        <div className="">
            <Tabs
                className="grid w-full grid-cols-12 gap-2"
                defaultValue={currentTab}
            >
                <TabsList className="col-span-3 justify-start h-auto grid max-sm:hidden w-full">
                    {dataPage?.data?.map(order => (
                        <TabsTrigger
                            key={order.slug}
                            className="flex flex-col"
                            value={order.slug}
                        >
                            <div className="">
                                <p>{order.orderId}</p>
                            </div>
                        </TabsTrigger>
                    ))}
                </TabsList>
                {dataPage?.data?.map(order => (
                    <TabsContent
                        key={order.slug}
                        className="col-span-9"
                        value={order.slug}
                    >
                        <OrderInspection form={form} order={order} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
