"use client";

import { useAppSelector } from "@/store";
import { ISalesOrder } from "@/types/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import XProgress from "@/components/x-progress";
import { ProdItemActions } from "@/components/actions/prod-item-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ItemDetailsSection from "./item-details";
import SalesEmailSection from "./sales-email-section";

export default function TabbedItemEmailOverview() {
  const order: ISalesOrder = useAppSelector((s) => s.slicers.dataPage.data);
  const isProd = order?.ctx?.prodPage;
  return (
    <div className="">
      <Tabs defaultValue="items" className="">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="emails">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <ItemDetailsSection />
        </TabsContent>
        <TabsContent value="emails">{/* <SalesEmailSection /> */}</TabsContent>
      </Tabs>
    </div>
  );
}
