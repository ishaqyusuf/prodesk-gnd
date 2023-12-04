"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/store";
import { ISalesOrder, ISalesOrderItem } from "@/types/sales";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import OrderInspection from "./order-inspection";
import PageHeader from "@/components/page-header";
import Btn from "@/components/btn";
import { truckBackOrder } from "@/lib/sales/truck-backorder";
import { openModal } from "@/lib/modal";
import { _startSalesDelivery } from "@/app/_actions/sales/delivery/start-sales-delivery";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { _readyForDelivery } from "@/app/_actions/sales/delivery/ready-for-delivery";
import { IDataPage } from "@/types/type";

export interface TruckLoaderForm {
    loader: {
        [orderSlug in string]: {
            items: ISalesOrderItem[];
            loadedItems: {
                [itemUid in string]: {
                    loadQty: string | number;
                    qty: number;
                    checked: boolean;
                };
            };
            truckLoadLocation: string;
            backOrders: {
                [itemUid in string]: {
                    backQty: number;
                    qty: number;
                    checked: boolean;
                    // loadQty: number;
                };
            };
            hasBackOrder?: Boolean;
        };
    };
    hasBackOrder?: Boolean;
    action: SalesInspectPageAction;
}
export type SalesInspectPageAction = "ready" | "load" | undefined;
export interface SalesDataPage
    extends IDataPage<{
        orders: ISalesOrder[];
        action: SalesInspectPageAction;
    }> {}
export default function LoadDelivery({ title }) {
    const [loadingTruck, startLoadingTruck] = useTransition();

    const dataPage: SalesDataPage = useAppSelector<{
        id;
        data: { orders: ISalesOrder[]; action };
    }>(s => s.slicers.dataPage);
    const form = useForm<TruckLoaderForm>({
        defaultValues: {
            loader: {}
        }
    });
    const router = useRouter();
    // useEffect(() => {},)
    function load() {
        startLoadingTruck(async () => {
            try {
                const data = truckBackOrder(form.getValues());
                data.action = dataPage?.data?.action;
                if (data.hasBackOrder) openModal("inspectBackOrder", data);
                else {
                    if (dataPage?.data?.action == "ready") {
                        await _startSalesDelivery(data);
                        toast.success("Delivery Truck Loaded!");
                    } else {
                        await _readyForDelivery(data);
                        toast.success("Ready For Delivery!");
                    }
                    // router.replace("/sales/delivery");
                }
            } catch (error) {
                toast.error((error as Error).message);
            }
        });
    }
    const [currentTab, setCurrentTab] = useState<string>();
    useEffect(() => {
        let loader: any = {};
        dataPage?.data?.orders?.map(order => {
            // loader[order.slug] = {};
            let orderLoader = {
                loadedItems: {},
                truckLoadLocation: "",
                items: []
            };

            order?.items?.map(f => {
                if (f.qty) {
                    orderLoader.loadedItems[f.meta.uid] = {
                        loadQty: f.qty,
                        qty: f.qty,
                        checked: true
                    };
                }
            });
            orderLoader.items = order.items as any;
            loader[order.slug] = orderLoader;
        });
        form.reset({
            loader
        });
        setCurrentTab(dataPage.data?.orders?.[0]?.slug);
    }, [dataPage]);
    function Tips({ color, info }) {
        return (
            <div className="inline-flex space-x-2 items-center">
                <div className={cn(`w-6 h-3 rounded shadow `)}></div>
            </div>
        );
    }
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <PageHeader title="Load Orders" />
                <div className="flex-1 flex justify-end space-x-2">
                    <Btn onClick={load} className="" isLoading={loadingTruck}>
                        {title}
                    </Btn>
                </div>
            </div>
            <Tabs
                className="grid w-full grid-cols-12 gap-2"
                defaultValue={currentTab}
            >
                <div className="col-span-3">
                    <TabsList className=" justify-start h-auto grid max-sm:hidden w-full">
                        {dataPage?.data?.orders?.map(order => (
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
                </div>
                {dataPage?.data?.orders?.map(order => (
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
