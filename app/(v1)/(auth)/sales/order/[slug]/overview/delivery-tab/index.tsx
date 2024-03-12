"use client";

import { useDataPage } from "@/lib/data-page-context";
import { SalesOverview } from "../../type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import { useModal } from "@/components/common/modal/provider";
import CreateDeliveryModal from "../../_modal/create-delivery";

export default function DeliveryTabIndex() {
    const { data: order } = useDataPage<SalesOverview>();
    const modal = useModal();
    return (
        <div>
            <Card className="">
                <CardHeader className="">
                    <div className="flex justify-between items-center">
                        <CardTitle className="">
                            <span>Deliveries</span>
                        </CardTitle>
                        <div>
                            <Button
                                onClick={() => {
                                    modal.openModal(
                                        <CreateDeliveryModal order={order} />
                                    );
                                }}
                                size={"sm"}
                            >
                                <Icons.add className="w-4 h-4 mr-4" />
                                <span>Create Delivery</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                {order.itemDeliveries?.length ? (
                    <CardContent></CardContent>
                ) : (
                    <CardContent className="h-[40vh] flex flex-col justify-center text-muted-foreground items-center">
                        {/* <Icons. */}
                        <span>No Deliveries</span>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
