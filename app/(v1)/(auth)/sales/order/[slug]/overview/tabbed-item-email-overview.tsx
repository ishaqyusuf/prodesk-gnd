"use client";

import { useAppSelector } from "@/store";
import { ISalesOrder } from "@/types/sales";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ItemDetailsSection from "./item-details";
import { useDataPage } from "@/lib/data-page-context";

export default function TabbedItemEmailOverview() {
    const { data: order } = useDataPage<ISalesOrder>();
    const isProd = order?.ctx?.prodPage;
    return (
        <div className="">
            <Tabs defaultValue="items" className="">
                {/* <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="emails">Notifications</TabsTrigger>
        </TabsList> */}
                <TabsContent value="items">
                    <ItemDetailsSection />
                </TabsContent>
                <TabsContent value="emails">
                    {/* <SalesEmailSection /> */}
                </TabsContent>
            </Tabs>
        </div>
    );
}

