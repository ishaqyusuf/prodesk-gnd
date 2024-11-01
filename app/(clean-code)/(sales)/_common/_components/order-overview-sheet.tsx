import TableItemOverviewSheet, {
    TableSheetHeader,
} from "@/components/(clean-code)/data-table/item-overview-sheet";
import { useInifinityDataTable } from "@/components/(clean-code)/data-table/use-data-table";
import { motion, AnimatePresence } from "framer-motion";
import { SalesItemProp } from "./orders-page-cells";

import { _modal } from "@/components/common/modal/provider";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewProvider, {
    useSalesOverview,
} from "./sales-overview/overview-provider";
import { SalesGeneralOverview } from "./sales-overview/sales-general-overview";
import { SalesItemsOverview } from "./sales-overview/sales-items-overview";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ItemProdView } from "./sales-overview/production/item-prod-view";
import { SalesShippingOverview } from "./sales-overview/sales-shipping-overview";
import { ShippingForm } from "./sales-overview/shipping/shipping-form";
import { cn } from "@/lib/utils";

export default function OrderOverviewSheet({}) {
    const { table, selectedRow } = useInifinityDataTable();
    const item: SalesItemProp = selectedRow?.original as any;
    if (!item) return;
    return (
        <TableItemOverviewSheet>
            <OverviewProvider item={item}>
                <div className="flex">
                    <SecondaryTab />

                    <PrimaryTab />
                </div>
            </OverviewProvider>
        </TableItemOverviewSheet>
    );
}
function PrimaryTab() {
    const ctx = useSalesOverview();
    return (
        <div
            className={cn(
                "w-[60vw] lg:w-[600px]",
                ctx.tabData && "hidden lg:block"
            )}
        >
            <TableSheetHeader title={ctx.item?.orderId} />
            <Tabs defaultValue="general">
                <TabsList className="w-full">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="items">Items</TabsTrigger>
                    {/* <TabsTrigger value="production">
                                    Production
                                </TabsTrigger> */}
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="shipping">Shipping</TabsTrigger>
                </TabsList>
                <ScrollArea className="h-[80vh]">
                    <TabsContent value="general">
                        <SalesGeneralOverview />
                    </TabsContent>
                    <TabsContent className="" value="items">
                        <SalesItemsOverview />
                    </TabsContent>
                    <TabsContent className="" value="shipping">
                        <SalesShippingOverview />
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>
    );
}
function SecondaryTab({}) {
    const ctx = useSalesOverview();
    if (!ctx.tabData) return null;
    function Render() {
        switch (ctx.tabData.slug) {
            case "itemView":
                return <ItemProdView />;
            case "createShipping":
                return <ShippingForm />;
        }
    }
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5 }}
                // className="absolute right-0 w-[500px] border-l bg-gray-100 p-4"
                className="border-r "
            >
                <Render />
            </motion.div>
        </AnimatePresence>
    );
}
