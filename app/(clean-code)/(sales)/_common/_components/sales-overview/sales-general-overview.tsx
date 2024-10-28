import { Menu } from "@/components/(clean-code)/menu";
import { useSalesOverview } from "./overview-provider";
import { DataLine } from "@/components/(clean-code)/data-table/Dl";
import { Progress } from "@/components/(clean-code)/progress";
import { TCell } from "@/components/(clean-code)/data-table/table-cells";
import { Label } from "@/components/ui/label";
import { Icon, Icons } from "@/components/_v1/icons";
import { SalesItemStatus } from "./sales-item-status";

export function SalesGeneralOverview({}) {
    const { item } = useSalesOverview();
    return (
        <>
            <dl>
                <DataLine label="Order Id" value={item.orderId} />
                {/* <DataLine label="Customer Name" value={item.displayName} />
                <DataLine label="Customer Phone" value={item.customerPhone} />
                <DataLine label="Customer Address" value={item.address} /> */}
                <DataLine label="Sales Rep" value={item.salesRep} />
                <DataLine label="P.O No." value={item.poNo} />
                <DataLine
                    label="Total Invoice"
                    value={
                        <TCell.Money
                            className="font-mono"
                            value={item.invoice.total}
                        />
                    }
                />
                <DataLine
                    label="Paid"
                    value={
                        <TCell.Money
                            className="font-mono"
                            value={item.invoice.paid}
                        />
                    }
                />
                <DataLine
                    label="Pending"
                    value={
                        <TCell.Money
                            className="font-mono"
                            value={item.invoice.pending}
                        />
                    }
                />
                <div className="grid py-4 grid-cols-2 px-4 sm:px-8 gap-4">
                    {[item.addressData.billing, item.addressData.shipping].map(
                        (address) => (
                            <div className="text-sm" key={address.id}>
                                <div>
                                    <Label>{address.title}</Label>
                                </div>
                                <DataLine.Icon
                                    icon="user"
                                    value={address.name}
                                />
                                <DataLine.Icon
                                    icon="phone"
                                    value={address.phone}
                                />
                                <DataLine.Icon
                                    icon="address"
                                    value={address.address}
                                />
                            </div>
                        )
                    )}
                </div>
                <div className="px-4 sm:px-8">
                    <SalesItemStatus
                        status={item.status.prodAssignment}
                        title="Assigned"
                    />
                    <SalesItemStatus
                        status={item.status.prod}
                        title="Production Completed"
                    />
                    <SalesItemStatus
                        status={item.status.dispatch}
                        title="Delivered"
                    />
                </div>
            </dl>
        </>
    );
}
