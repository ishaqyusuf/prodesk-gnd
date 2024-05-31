"use client";
import { useDataPage } from "@/lib/data-page-context";
import { SalesOverviewType } from "../overview-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/common/modal/provider";
import { Icons } from "@/components/_v1/icons";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/use-day";
import SalesNoteModal from "../../../_components/_sales-note/_modal";

export default function TimelineSection() {
    const { data } = useDataPage<SalesOverviewType>();

    const modal = useModal();
    return (
        <div className="col-span-1">
            <Card className="max-sm:border-none">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Timeline</span>
                        <div>
                            <Button
                                onClick={() => {
                                    modal.openSheet(
                                        <SalesNoteModal
                                            edit
                                            id={data.id}
                                            orderId={data.orderId}
                                        />
                                    );
                                }}
                                className="h-8 w-8 p-0"
                                variant="outline"
                            >
                                <Icons.add className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="">
                    <Table>
                        <TableBody>
                            {data.progress?.map((item, key) => (
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
