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

export default function ItemDetailsSection() {
  const order: ISalesOrder = useAppSelector((s) => s.slicers.dataPage.data);
  const isProd = order?.ctx?.prodPage;
  return (
    <div className="">
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-1">Item</TableHead>
                <TableHead className="px-1">Swing</TableHead>
                <TableHead className="w-16 px-1 text-center">Qty</TableHead>
                {!isProd ? (
                  <TableHead className="t w-20 px-1 text-left">Cost</TableHead>
                ) : (
                  <>
                    <TableHead className="w-20 px-1">Production</TableHead>
                    <TableHead className="w-20 px-1 text-left"></TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item, key) => (
                <TableRow key={key}>
                  <TableCell className="p-2">
                    <p className="">{item.description}</p>
                  </TableCell>
                  <TableCell className="p-2 ">
                    <p className="whitespace-nowrap font-semibold text-muted-foreground">
                      {item.swing}
                    </p>
                  </TableCell>
                  <TableCell className="p-2 text-center font-semibold text-muted-foreground">
                    <p>{item.qty}</p>
                  </TableCell>
                  {!isProd ? (
                    <TableCell className="p-2 text-right font-semibold text-muted-foreground">
                      <span>${item.total}</span>
                    </TableCell>
                  ) : (
                    <>
                      <TableCell className="p-2 text-muted-foreground">
                        {item.swing ? (
                          <div className="grid gap-1">
                            <span>
                              {item.meta.produced_qty || 0} of {item.qty}
                            </span>
                            <XProgress
                              completed={item.meta.produced_qty}
                              total={item.qty}
                            />
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="p-2 font-semibold text-muted-foreground">
                        {item.swing && <ProdItemActions item={item} />}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
