"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useDataPage } from "@/lib/data-page-context";
import { openModal } from "@/lib/modal";
import { formatDate } from "@/lib/use-day";
import { useAppSelector } from "@/store";
import { dispatchSlice } from "@/store/slicers";
import { ISalesOrder } from "@/types/sales";
import { Plus } from "lucide-react";

export default function Timeline() {
    const { data: order } = useDataPage<ISalesOrder>();

    return (
        <div className="col-span-1">
            <Card className="max-sm:border-none">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Timeline</span>
                        <div>
                            <Button
                                onClick={() => {
                                    openModal("salesTimeline", order);
                                }}
                                className="h-8 w-8 p-0"
                                variant="outline"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="">
                    <Table>
                        <TableBody>
                            {order.progress?.map((item, key) => (
                                <TableRow key={key}>
                                    {/* <TableCell className="p-1">
                      <p>{item.createdAt as any}</p>
                  </TableCell> */}

                                    <TableCell className="p-1 space-y-1">
                                        <div className="flex justify-between space-x-2">
                                            <p className="font-medium">
                                                {item.status}
                                            </p>
                                            <p className="text-muted-foreground font-semibold">
                                                {formatDate(item.createdAt)}
                                            </p>
                                        </div>
                                        <p className="text-muted-foreground">
                                            {item.headline}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

